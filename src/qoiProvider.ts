import * as vscode from 'vscode';
import { QoiPreview } from './qoiPreview';

export class QoiCustomProvider implements vscode.CustomReadonlyEditorProvider {
  public static readonly viewType = 'qoi.preview';

  private readonly _previews = new Set<QoiPreview>();
  private _activePreview: QoiPreview | undefined;

  constructor(private readonly extensionRoot: vscode.Uri) {}

  public openCustomDocument(uri: vscode.Uri): vscode.CustomDocument {
    return { uri, dispose: (): void => {} };
  }

  public async resolveCustomEditor(
    document: vscode.CustomDocument,
    webviewEditor: vscode.WebviewPanel
  ): Promise<void> {
    const preview = new QoiPreview(
      this.extensionRoot,
      document.uri,
      webviewEditor
    );
    this._previews.add(preview);
    this.setActivePreview(preview);

    webviewEditor.onDidDispose(() => {
      this._previews.delete(preview);
    });

    webviewEditor.onDidChangeViewState(() => {
      if (webviewEditor.active) {
        this.setActivePreview(preview);
      } else if (this._activePreview === preview && !webviewEditor.active) {
        this.setActivePreview(undefined);
      }
    });
  }

  public get activePreview(): QoiPreview {
    return this._activePreview;
  }

  private setActivePreview(value: QoiPreview | undefined): void {
    this._activePreview = value;
  }
}