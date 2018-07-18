import * as vscode from 'vscode';

import { GoToMethodProvider } from './goToMethod';

export function activate(context: vscode.ExtensionContext) {
    const goToMethodProvider = new GoToMethodProvider();
    goToMethodProvider.initialise(context);
}
