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
    private constructor() { }

    public static fromSymbolInformation(symbol: SymbolInformation) {
        const entry = new SymbolEntry();
        entry.label = symbol.name;
        entry.description = symbol.containerName;
        entry.range = symbol.location.range;

        return entry;
    }

    public static fromLabel(label: string) {
        const entry = new SymbolEntry();
        entry.label = label;

        return entry;
    }

    public label!: string;
    public description?: string;
    public detail?: string;
    public picked?: boolean;
    public range?: Range;
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

        const symbolEntries = this.getSymbols(activeTextEditor.document)
            .then(syms => {
                if (syms.length === 0) {
                    return [SymbolEntry.fromLabel('No symbols found')];
                }

                return syms.filter(symbol =>
                    symbol.kind === SymbolKind.Method ||
                    symbol.kind === SymbolKind.Function ||
                    symbol.kind === SymbolKind.Constructor)
                    .map(sym => SymbolEntry.fromSymbolInformation(sym));
            });

        const currentRange = activeTextEditor.visibleRanges.length > 0
            ? activeTextEditor.visibleRanges[0]
            : new Range(0, 0, 0, 0);

        const pickedItem = await window.showQuickPick(symbolEntries, {
            onDidSelectItem: (selectedItem: SymbolEntry) => {
                if (!selectedItem.range) { return; }

                // Preview the selected item by highlighting the scope and scrolling to it
                activeTextEditor.setDecorations(this.decorationType, [selectedItem.range]);
                activeTextEditor.revealRange(selectedItem.range, TextEditorRevealType.Default);
            }
        });

        // Clear decorations
        activeTextEditor.setDecorations(this.decorationType, []);

        if (pickedItem && pickedItem.range) {
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
