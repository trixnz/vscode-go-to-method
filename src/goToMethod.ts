import {
    TextDocument,
    SymbolInformation,
    ExtensionContext,
    QuickPickItem,
    commands,
    window,
    SymbolKind,
    TextEditorRevealType,
    TextEditorDecorationType,
    ThemeColor,
    Range,
    Selection
} from 'vscode';

class SymbolEntry implements QuickPickItem {
    public constructor(symbol: SymbolInformation) {
        this.label = symbol.name;
        this.description = symbol.containerName;
        this.range = symbol.location.range;
    }

    public label!: string;
    public description?: string | undefined;
    public detail?: string | undefined;
    public picked?: boolean | undefined;
    public range: Range;
}

export class GoToMethodProvider {
    private decorationType!: TextEditorDecorationType;

    public initialise(context: ExtensionContext) {
        context.subscriptions.push(
            commands.registerCommand('workbench.action.gotoMethod', () => this.showQuickView())
        );

        this.decorationType = window.createTextEditorDecorationType({
            isWholeLine: true,
            backgroundColor: new ThemeColor('editor.rangeHighlightBackground')
        });
        context.subscriptions.push(this.decorationType);
    }

    private async getSymbols(document: TextDocument): Promise<SymbolInformation[]> {
        const result = await commands.executeCommand<SymbolInformation[]>(
            'vscode.executeDocumentSymbolProvider',
            document.uri
        );

        return result || [];
    }

    private async showQuickView() {
        const activeTextEditor = window.activeTextEditor;
        if (!activeTextEditor) { return; }

        const symbols = await this.getSymbols(activeTextEditor.document);
        if (symbols.length === 0) { return; }

        const symbolEntries = symbols
            .filter(sym =>
                sym.kind === SymbolKind.Method ||
                sym.kind === SymbolKind.Function ||
                sym.kind === SymbolKind.Constructor)
            .map(sym => new SymbolEntry(sym));

        const currentRange = activeTextEditor.visibleRanges.length > 0
            ? activeTextEditor.visibleRanges[0]
            : new Range(0, 0, 0, 0);

        const pickedItem = await window.showQuickPick(symbolEntries, {
            onDidSelectItem: (selectedItem: SymbolEntry) => {
                // Preview the selected item by highlighting the scope and scrolling to it
                activeTextEditor.setDecorations(this.decorationType, [selectedItem.range]);
                activeTextEditor.revealRange(selectedItem.range, TextEditorRevealType.Default);
            }
        });

        // Clear decorations
        activeTextEditor.setDecorations(this.decorationType, []);

        if (pickedItem) {
            const range = pickedItem.range;

            // Scroll to the selected function, positioning the cursor at the beginning
            activeTextEditor.revealRange(range, TextEditorRevealType.Default);
            activeTextEditor.selection = new Selection(range.start, range.start);
        } else {
            // Restore the old scroll position
            activeTextEditor.revealRange(currentRange, TextEditorRevealType.Default);
        }
    }
}
