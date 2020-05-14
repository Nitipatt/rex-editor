import React from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  DefaultDraftBlockRenderMap,
  Modifier,
} from "draft-js";
import "./scss/RexEditor.scss";
import Immutable from "immutable";
import { SketchPicker } from "react-color";

class CustomBlock extends React.Component {
  render() {
    return <div className="CustomBlock">{this.props.children}</div>;
  }
}
const blockRenderMap = Immutable.Map({
  CustomBlock: {
    element: "div",
    wrapper: <CustomBlock />,
  },
  textLeft: {
    element: "div",
  },
  textCenter: {
    element: "div",
  },
  textRight: {
    element: "div",
  },
});

const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(blockRenderMap);
export default class RexEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(),
      styleMap: {},
      style: {
        color: "#000",
        fontSize: "18px",
      },
      showColorPicker: false,
    };
    this.RexEditorRef = React.createRef();
  }
  setNewEditorState = (newState) => {
    this.setState({ editorState: newState });
  };
  onTextChange = (editorState) => {
    this.setState({ editorState });
  };
  handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onTextChange(newState);
      return "handled";
    }
    return "not-handled";
  };
  onMenuClick = (command) => {
    console.log(command + " clicked");
    switch (command) {
      case "undo":
        return this.setNewEditorState(EditorState.undo(this.state.editorState));
      case "redo":
        return this.setNewEditorState(EditorState.redo(this.state.editorState));
      case "text-left":
        return this.setBlockType("textLeft");
      case "text-center":
        return this.setBlockType("textCenter");
      case "text-right":
        return this.setBlockType("textRight");
      case "unordered-list":
        return this.setBlockType("unordered-list-item");
      case "ordered-list":
        return this.setBlockType("ordered-list-item");
      case "color-picker":
        return this.setState({ showColorPicker: !this.state.showColorPicker })
      case "set-color":
        return this.activeStyle("color")
      case "get-html":
        return this.getHTML()
      case "set-font-size":
        return this.activeStyle("fontSize")
      default:
        return this.handleKeyCommand(command, this.state.editorState);
    }
  };
  getBlockStyle = (block) => {
    const type = block.getType();
    switch (type) {
      case "textLeft":
        return "text-left";
      case "textCenter":
        return "text-center";
      case "textRight":
        return "text-right";
      default:
        return "";
    }
  };
  setBlockType = (blockType) => {
    const editorState = RichUtils.toggleBlockType(
      this.state.editorState,
      blockType
    );
    this.setState({ editorState });
  };
  // getSelectedBlock = () => {
  //   const { editorState } = this.state;
  //   var startKey = editorState.getSelection().getStartKey();
  //   var selectedBlock = editorState
  //     .getCurrentContent()
  //     .getBlockForKey(startKey);
  //   console.log(selectedBlock);
  // };
  setStyleState = (state, value) => {
    this.setState({ style: { ...this.state.style, ...{ [state]: value } } });
  };
  activeStyle = async (cssAttr) => {
    await this.setStyleMap(cssAttr, this.state.style[cssAttr]);
    this.setStyleMapToEditor(cssAttr);
  };
  setStyleMap = (cssAttr, value) => {
    return new Promise((resolve) => {
      this.setState(
        {
          styleMap: {
            [cssAttr]: {
              [cssAttr]: value,
            },
          },
        },
        resolve()
      );
    });
  };
  setStyleMapToEditor = (toggledStyle) => {
    const { editorState } = this.state;
    const nextContentState = editorState.getCurrentContent();
    let nextEditorState = EditorState.push(
      editorState,
      nextContentState,
      "change-inline-style"
    );
    nextEditorState = RichUtils.toggleInlineStyle(
      nextEditorState,
      toggledStyle
    );
    this.setNewEditorState(nextEditorState);
  };
  getHTML = () => {
    // Use function
    const addStyle = (element, styleName, value) => {
      return (element.style[styleName] = value);
    };
    // iterate function
    const transformList = (wrapper, contentDiv) => {
      for (let item of contentDiv.children) {
        const itemTagName = item.tagName;
        let rowWrapper = document.createElement(itemTagName);

        if (["UL", "OL"].includes(itemTagName)) {
          rowWrapper = transformList(rowWrapper, item);
        } else {
          const rowClassList = item.classList;
          for (let rowClass of rowClassList) {
            switch (rowClass) {
              case "text-left":
                addStyle(rowWrapper, "text-align", "left");
                break;
              case "text-center":
                addStyle(rowWrapper, "text-align", "center");
                break;
              case "text-right":
                addStyle(rowWrapper, "text-align", "right");
                break;
              default:
                break;
            }
          }

          for (let span of item.children[0].children) {
            const styleList = span.style;
            let spanText = document.createElement("span");
            for (let style of styleList) {
              addStyle(spanText, style, styleList[style]);
            }
            spanText.innerText = span.children[0]?.innerText;
            rowWrapper.appendChild(spanText);
          }
        }
        wrapper.appendChild(rowWrapper);
      }
      return wrapper;
    };
    // Clone element
    const contentDiv = this.RexEditorRef.current.editor.children[0].cloneNode(
      true
    );

    let wrapper = document.createElement("div");
    wrapper = transformList(wrapper, contentDiv);
    console.log(wrapper);
  };

  render() {
    return (
      <div className="rex-editor">
        <div
          className="color-picker"
          style={{
            display: this.state.showColorPicker ? "block" : "none",
            position: "absolute",
            zIndex: 999,
          }}
        >
          <SketchPicker
            color={this.state.style.color}
            onChangeComplete={(color) => {
              this.setStyleState("color", color.hex);
            }}
          />
        </div>
        <div className="menu-bar">
          <button onClick={() => this.onMenuClick("bold")}>B</button>
          <button onClick={() => this.onMenuClick("italic")}>I</button>
          <button onClick={() => this.onMenuClick("underline")}>U</button>
          <button onClick={() => this.onMenuClick("text-left")}>Left</button>
          <button onClick={() => this.onMenuClick("text-center")}>Center</button>
          <button onClick={() => this.onMenuClick("text-right")}>Right</button>
          <button onClick={() => this.onMenuClick("unordered-list")}>...</button>
          <button onClick={() => this.onMenuClick("ordered-list")}>123</button>
          <button onClick={() => this.onMenuClick("undo")}>Undo</button>
          <button onClick={() => this.onMenuClick("redo")}>Redo</button>
          <button onClick={() => this.onMenuClick("color-picker")}>Color Picker</button>
          <button onClick={() => this.onMenuClick("set-color")}>Set Color</button>
          <button onClick={() => this.onMenuClick("set-font-size")}>Set Size</button>
          <button onClick={() => this.onMenuClick("get-html")}>HTML</button>
          {/* <button onClick={() => this.getSelectedBlock()}>Get Selection block</button> */}
        </div>
        <Editor
          customStyleMap={this.state.styleMap}
          editorState={this.state.editorState}
          onChange={this.onTextChange}
          handleKeyCommand={this.handleKeyCommand}
          blockStyleFn={this.getBlockStyle}
          blockRenderMap={extendedBlockRenderMap}
          ref={this.RexEditorRef}
        />
      </div>
    );
  }
}
