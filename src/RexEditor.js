import React from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  DefaultDraftBlockRenderMap,
  Modifier
} from "draft-js";
import "./scss/RexEditor.scss";
import Immutable from "immutable";
import { SketchPicker } from 'react-color';

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
    this.state = { editorState: EditorState.createEmpty(),
      colorStyleMap: {
        black: {
          color: 'black',
        }
      }};
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
    }
  };
  setBlockType = (blockType) => {
    const editorState = RichUtils.toggleBlockType(
      this.state.editorState,
      blockType
    );
    this.setState({ editorState });
  };
  getSelectedBlock = () => {
    const { editorState } = this.state;
    var startKey = editorState.getSelection().getStartKey();
    var selectedBlock = editorState
      .getCurrentContent()
      .getBlockForKey(startKey);
    console.log(selectedBlock);
  };
  setColorStyleMap = (color) => {
    return new Promise((resolve)=>{
      this.setState({colorStyleMap: {
        [color]: {
          color: color,
        }
      }}, resolve())
    })
  }
  setColor = (toggledColor = '#000') => {

    const { editorState, colorStyleMap } = this.state;
    const selection = editorState.getSelection();
    // remove all current style color
    // const nextContentState = Object.keys(colorStyleMap).reduce(
    //   (contentState, color) => {
    //     return Modifier.removeInlineStyle(contentState, selection, color);
    //   },
    //   editorState.getCurrentContent()
    // );

    const nextContentState = editorState.getCurrentContent()

    let nextEditorState = EditorState.push(
      editorState,
      nextContentState,
      "change-inline-style"
    );
    const currentStyle = editorState.getCurrentInlineStyle();

    // Unset style override for current color.
    if (selection.isCollapsed()) {
      nextEditorState = currentStyle.reduce((state, color) => {
        return RichUtils.toggleInlineStyle(state, color);
      }, nextEditorState);
    }
    // If the color is being toggled on, apply it.
    if (!currentStyle.has(toggledColor)) {
      nextEditorState = RichUtils.toggleInlineStyle(
        nextEditorState,
        toggledColor
      );
    }

    this.setNewEditorState(nextEditorState);
  };

  render() {
    return (
      <div className="rex-editor">
        <SketchPicker
          color={ Object.keys(this.state.colorStyleMap)[0] }
          onChangeComplete={ (color)=>{this.setColorStyleMap(color.hex)} }
        />
        <div className="menu-bar">
          <button onClick={() => this.onMenuClick("bold")}>B</button>
          <button onClick={() => this.onMenuClick("italic")}>I</button>
          <button onClick={() => this.onMenuClick("underline")}>U</button>
          <button onClick={() => this.onMenuClick("text-left")}>Left</button>
          <button onClick={() => this.onMenuClick("text-center")}>
            Center
          </button>
          <button onClick={() => this.onMenuClick("text-right")}>Right</button>
          <button onClick={() => this.onMenuClick("undo")}>Undo</button>
          <button onClick={() => this.onMenuClick("redo")}>Redo</button>
          {/* <button onClick={() => this.getSelectedBlock()}>
            Get Selection block
          </button> */}
          <button onClick={() => this.setColor(Object.keys(this.state.colorStyleMap)[0])}>Set Color</button>
        </div>
        <Editor
          customStyleMap={this.state.colorStyleMap}
          editorState={this.state.editorState}
          onChange={this.onTextChange}
          handleKeyCommand={this.handleKeyCommand}
          blockStyleFn={this.getBlockStyle}
          blockRenderMap={extendedBlockRenderMap}
        />
      </div>
    );
  }
}
