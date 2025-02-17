import PdfHighlighter from "./components/PdfHighlighter";
import TextHighlight from "./components/TextHighlight";
import MonitoredHighlightContainer from "./components/MonitoredHighlightContainer";
import AreaHighlight from "./components/AreaHighlight";
import PdfLoader from "./components/PdfLoader";
import { HighlightContainerUtils, useHighlightContainerContext } from "./contexts/HighlightContext";
import {
  viewportPositionToScaled,
  scaledPositionToViewport,
} from "./lib/coordinates";

import { PdfHighlighterUtils, usePdfHighlighterContext } from "./contexts/PdfHighlighterContext";

export {
  PdfHighlighter,
  PdfLoader,
  TextHighlight,
  MonitoredHighlightContainer,
  AreaHighlight,
  useHighlightContainerContext,
  viewportPositionToScaled,
  scaledPositionToViewport,
  usePdfHighlighterContext
};

export type {
  HighlightContainerUtils,
  PdfHighlighterUtils
};
export * from "./types";
