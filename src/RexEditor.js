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
import MenuBar from './MenuBar';

const blockRenderMap = Immutable.Map({
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
      defaulfStyle: {
        color: "#000",
        fontSize: "14px",
      },
      style: {},
    };
    this.RexEditorRef = React.createRef();
  }
  componentDidMount(){
    this.setState({style: this.state.defaulfStyle})
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
    Object.entries(this.state.defaulfStyle).forEach((item)=>{
      wrapper.style[item[0]] = item[1]
    })
    wrapper = transformList(wrapper, contentDiv);
    console.log(wrapper);
  };
  undo = () => {
    this.setNewEditorState(EditorState.undo(this.state.editorState));
  }
  redo = () => {
    this.setNewEditorState(EditorState.redo(this.state.editorState));
  }
  handleKey = (command) => {
    this.handleKeyCommand(command, this.state.editorState)
  }

  render() {
    const {
      setNewEditorState,
      setBlockType,
      activeStyle,
      getHTML,
      setStyleState,
      handleKey,
      undo,
      redo
    } = this
    return (
      <div className="rex-editor">
        <MenuBar 
            style = {this.state.style}
            funcProps = {
              {
              setNewEditorState,
              setBlockType,
              activeStyle,
              getHTML,
              setStyleState,
              handleKey,
              undo,
              redo}
            }
        ></MenuBar>
        <div className="editor-section" style={this.state.defaulfStyle}>
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
      </div>
    );
  }
}
