import React from "react";
import { Editor, EditorState, RichUtils } from "draft-js";
import './scss/RexEditor.scss';
export default class RexEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = { editorState: EditorState.createEmpty() };
  }
  setNewEditorState = (newState) => {
    this.setState({editorState: newState})
  }
  onTextChange = (editorState) => {
    this.setState({ editorState });
  };
  handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onTextChange(newState);
      return 'handled';
    }
    return 'not-handled';
  }
  onMenuClick = (command) => {
    console.log(command+' clicked')
    switch(command){
      case 'undo': return this.setNewEditorState(EditorState.undo(this.state.editorState))
      case 'redo': return this.setNewEditorState(EditorState.redo(this.state.editorState))
      default: return this.handleKeyCommand(command, this.state.editorState)
    }
  }
  getBlockStyle = (block) => {
    // console.log(block.getText())
   }
  test = () => {
    console.log(this.state.editorState.getCurrentContent().getBlocksAsArray())
  }
  render() {
    return (
      <div className="rex-editor">
        <div className='menu-bar'>
          <button onClick={()=>this.onMenuClick('bold')}>B</button>
          <button onClick={()=>this.onMenuClick('italic')}>I</button>
          <button onClick={()=>this.onMenuClick('underline')}>U</button>
          <button onClick={()=>this.onMenuClick('undo')}>Undo</button>
          <button onClick={()=>this.onMenuClick('redo')}>Redo</button>
          <button onClick={()=>this.test()}>test</button>
        </div>
        <Editor editorState={this.state.editorState} onChange={this.onTextChange} handleKeyCommand={this.handleKeyCommand} blockStyleFn={this.getBlockStyle}/>
      </div>
    );
  }
}
