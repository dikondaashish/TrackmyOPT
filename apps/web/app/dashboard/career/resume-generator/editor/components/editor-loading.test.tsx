import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LatexEditorPane } from "./LatexEditorPane";
import { PdfPreviewPane, type PdfPreviewPaneProps } from "./PdfPreviewPane";
import { deriveGenerationSteps } from "@/lib/resume/generation-steps";

vi.mock("./PdfSelectablePreview", () => ({ PdfSelectablePreview: () => <div>Visible resume PDF</div> }));
vi.mock("./AtsScorePanel", () => ({ AtsScorePanel: () => null }));
vi.mock("./ApplyReadinessChecklist", () => ({ ApplyReadinessChecklist: () => null }));

const previewProps: PdfPreviewPaneProps = {
    viewMode: "split", generatedLatex: "", jobDescription: "", jobTitle: null,
    selectedTemplateId: null, atsAnalysis: null, pdfParseOk: null, compiledPdfBlob: null,
    compileFailed: false, isPdfStale: false, isGenerating: true, isCompiling: false,
    isScanning: false, isAutoFixing: false, pdfHighlightQuery: null,
    onRefreshPdf: vi.fn(), onPdfTextSelect: vi.fn(), onImproveForAts: vi.fn(), onDeepScan: vi.fn(),
};

describe("editor loading states", () => {
    it("keeps generation steps in the source pane, and shows a separate PDF loader", () => {
        const steps = deriveGenerationSteps({
            isGenerating: true, isCompiling: false, isScanning: false, isAutoFixing: false,
            hasLatex: false, hasPdf: false, compileFailed: false, pdfParseOk: null, atsScore: null,
        });
        const { unmount } = render(<LatexEditorPane viewMode="split" textareaRef={createRef()}
            editorValue="" generatedLatex="" isGenerating generationSteps={steps}
            onChangeText={vi.fn()} onSelectionSync={vi.fn()} onOpenFeedback={vi.fn()} />);
        expect(screen.getByText("Building your resume")).toBeVisible();
        unmount();
        render(<PdfPreviewPane {...previewProps} />);
        expect(screen.getByRole("status")).toHaveTextContent("Preparing preview…");
        expect(screen.queryByText("Building your resume")).not.toBeInTheDocument();
    });

    it("keeps a ready PDF visible through compilation and ATS checks", () => {
        const { rerender } = render(<PdfPreviewPane {...previewProps} compiledPdfBlob={new Blob(["pdf"])} isCompiling />);
        expect(screen.getByText("Visible resume PDF")).toBeVisible();
        expect(screen.getByRole("status")).toHaveTextContent("Updating preview…");
        rerender(<PdfPreviewPane {...previewProps} compiledPdfBlob={new Blob(["pdf"])} isGenerating={false} isScanning />);
        expect(screen.getByText("Visible resume PDF")).toBeVisible();
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("shows available source while the remaining steps run", () => {
        const steps = deriveGenerationSteps({
            isGenerating: false, isCompiling: true, isScanning: false, isAutoFixing: false,
            hasLatex: true, hasPdf: false, compileFailed: false, pdfParseOk: null, atsScore: null,
        });
        render(<LatexEditorPane viewMode="split" textareaRef={createRef()}
            editorValue="Complete source" generatedLatex="Complete source" isGenerating={false}
            generationSteps={steps} onChangeText={vi.fn()} onSelectionSync={vi.fn()} onOpenFeedback={vi.fn()} />);
        expect(screen.getByRole("textbox", { name: "LaTeX source" })).toHaveValue("Complete source");
        expect(screen.getByText("Compiling the PDF preview")).toBeVisible();
    });

    it("shows the loader when regenerating after a previous compile failure", () => {
        render(<PdfPreviewPane {...previewProps} generatedLatex="Earlier source" compileFailed />);
        expect(screen.getByRole("status")).toHaveTextContent("Preparing preview…");
        expect(screen.queryByRole("button", { name: "Retry compile" })).not.toBeInTheDocument();
    });
});
