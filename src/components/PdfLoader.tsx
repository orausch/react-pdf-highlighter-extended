import React, { ReactNode, useEffect, useRef, useState } from "react";

import type {
  OnProgressParameters,
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
} from "pdfjs-dist";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist/legacy/build/pdf";
import {
  DocumentInitParameters,
  TypedArray,
} from "pdfjs-dist/types/src/display/api";

const DEFAULT_BEFORE_LOAD = (progress: OnProgressParameters) => (
  <div style={{ color: "black" }}>
    Loading {Math.floor((progress.loaded / progress.total) * 100)}%
  </div>
);

const DEFAULT_ERROR_MESSAGE = (error: Error) => (
  <div style={{ color: "black" }}>{error.message}</div>
);

const DEFAULT_ON_ERROR = (error: Error) => {
  throw new Error(`Error loading PDF document: ${error.message}!`);
};

const DEFAULT_WORKER_SRC =
  "https://unpkg.com/pdfjs-dist@3.8.162/build/pdf.worker.min.js";

/**
 * The props type for {@link PdfLoader}.
 */
interface PdfLoaderProps {
  /**
   * The document to be loaded by PDF.js.
   * If you need to pass HTTP headers, auth parameters,
   * or other pdf settings, do it through here.
   */
  document: string | URL | TypedArray | ArrayBuffer | DocumentInitParameters;

  /**
   * Callback to render content before the PDF document is loaded.
   *
   * @param progress - PDF.js progress status.
   */
  beforeLoad?: (progress: OnProgressParameters) => ReactNode;

  /**
   * Component to render in the case of any PDF loading errors.
   */
  errorMessage?: (error: Error) => ReactNode;

  /**
   * Child components to use/render the loaded PDF document.
   *
   * @param pdfDocument - The loaded PDF document.
   */
  children: (pdfDocument: PDFDocumentProxy) => ReactNode;

  /**
   * Callback triggered whenever an error occurs.
   *
   * @param error - PDF Loading error triggering the event.
   */
  onError?: (error: Error) => void;

  /**
   * NOTE: This will be applied to all PdfLoader instances.
   * If you want to only apply a source to this instance, use the document parameters.
   */
  workerSrc?: string;
}

/**
 * A component for loading a PDF document and passing it to a child.
 *
 * @category Component
 */
const PdfLoader = ({
  document,
  beforeLoad = DEFAULT_BEFORE_LOAD,
  errorMessage = DEFAULT_ERROR_MESSAGE,
  children,
  onError = DEFAULT_ON_ERROR,
  workerSrc = DEFAULT_WORKER_SRC,
}: PdfLoaderProps) => {
  const pdfLoadingTaskRef = useRef<null | PDFDocumentLoadingTask>(null);
  const pdfDocumentRef = useRef<PDFDocumentProxy | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loadingProgress, setLoadingProgress] =
    useState<OnProgressParameters | null>(null);

  // Intitialise document
  useEffect(() => {
    GlobalWorkerOptions.workerSrc = workerSrc;
    pdfLoadingTaskRef.current = getDocument(document);
    pdfLoadingTaskRef.current.onProgress = (progress: OnProgressParameters) => {
      setLoadingProgress(progress.loaded >= progress.total ? null : progress);
    };

    pdfLoadingTaskRef.current.promise
      .then((pdfDocument: PDFDocumentProxy) => {
        pdfDocumentRef.current = pdfDocument;
      })
      .catch((error: Error) => {
        if (error.message != "Worker was destroyed") {
          setError(error);
          onError(error);
        }
      })
      .finally(() => {
        setLoadingProgress(null);
      });

    return () => {
      if (pdfLoadingTaskRef.current) {
        pdfLoadingTaskRef.current.destroy();
      }

      if (pdfDocumentRef.current) {
        pdfDocumentRef.current.destroy();
      }
    };
  }, [document]);

  return error
    ? errorMessage(error)
    : loadingProgress
      ? beforeLoad(loadingProgress)
      : pdfDocumentRef.current && children(pdfDocumentRef.current);
};

export default PdfLoader;
