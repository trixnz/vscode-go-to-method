# Go To Method
The standard `Go to Symbol in File...` feature of VSCode can be noisy when you're only interested in functions. This extension adds a `Go to Method in File...` feature that allows you focus only on the functions declared in the file.

## Installing
* Launch VS Code Quick Open (Ctrl+P), paste the following command, and press enter:
* `ext install go-to-method`

Alternatively, you can download the extension from the [marketplace](https://marketplace.visualstudio.com/items?itemName=trixnz.go-to-method).

## Usage
* Open the `Commands Palette` (Ctrl+Shift+P) and select `Go to Method in File...`
* Alternatively, bind a key to the command `workbench.action.gotoMethod`

*Note: No default keybinding is provided*

![Usage](images/usage.gif)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.