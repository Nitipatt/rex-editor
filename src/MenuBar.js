import React, { Fragment } from "react";
import "./scss/MenuBar.scss";
import "./scss/fontawesome/css/all.min.css"
import { SketchPicker } from "react-color";
export default class MenuBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showColorPicker: false
    }
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  setColorRef = (node) => {
    this.colorRef = node;
  }

  handleClickOutside = (event) => {
    console.log(this.colorRef)
    if (this.colorRef && !this.colorRef?.contains(event.target)) {
      this.setState({showColorPicker: false}, ()=>{
        this.onMenuClick("set-color")
      })
    }
  }
  
  onMenuClick = (command) => {
    console.log(command + " clicked");
    switch (command) {
      case "undo":
        return this.props.funcProps.undo();
      case "redo":
        return this.props.funcProps.redo();
      case "text-left":
        return this.props.funcProps.setBlockType("textLeft");
      case "text-center":
        return this.props.funcProps.setBlockType("textCenter");
      case "text-right":
        return this.props.funcProps.setBlockType("textRight");
      case "unordered-list":
        return this.props.funcProps.setBlockType("unordered-list-item");
      case "ordered-list":
        return this.props.funcProps.setBlockType("ordered-list-item");
      case "color-picker":
        return this.setState({ showColorPicker: !this.state.showColorPicker })
      case "set-color":
        return this.props.funcProps.activeStyle("color")
      case "get-html":
        return this.props.funcProps.getHTML()
      case "set-font-size":
        return this.props.funcProps.activeStyle("fontSize")
      case "heading":
        return;
      default:
        return this.props.funcProps.handleKey(command);
    }
  };
  renderButton = (iconClass,functionParam) => {
    return <div key={iconClass} className="icon-btn" onClick={() => this.onMenuClick(functionParam)}>
      <i className={iconClass}></i>
    </div>
  }
  render() {
    const menuList = [
      {
        name: 'bold',
        icon: 'fas fa-bold' 
      },
      {
        name: 'italic',
        icon: 'fas fa-italic' 
      },
      {
        name: 'underline',
        icon: 'fas fa-underline' 
      },{
        name: 'text-left',
        icon: 'fas fa-align-left' 
      },{
        name: 'text-center',
        icon: 'fas fa-align-center' 
      },{
        name: 'text-right',
        icon: 'fas fa-align-right' 
      },{
        name: 'unordered-list',
        icon: 'fas fa-list-ul' 
      },{
        name: 'ordered-list',
        icon: 'fas fa-list-ol' 
      },{
        name: 'undo',
        icon: 'fas fa-undo' 
      },{
        name: 'redo',
        icon: 'fas fa-redo-alt' 
      },
    ]
    return (
      <Fragment>
        <div
          className="color-picker"
          ref={this.setColorRef}
          style={{
            display: this.state.showColorPicker ? "block" : "none",
            position: "absolute",
            zIndex: 999,
          }}
        >
          <SketchPicker
            color={this.props.style.color}
            onChangeComplete={(color) => {
              this.props.funcProps.setStyleState("color", color.hex);
            }}
          />
        </div>
        <div className="menu-bar">
          <div className="icon-btn" onClick={() => this.onMenuClick('heading')}>
            <i className='fas fa-heading'></i>
          </div>
          {
            menuList.map(item=>this.renderButton(item.icon, item.name))
          }
          <div className="icon-btn color-picker" onClick={() => this.onMenuClick("set-color")}>
            <div className='show-color' style={{backgroundColor: this.props.style.color}}></div>
            <i className='fas fa-font'></i>
            <div className='drop-down' onClick={() => this.onMenuClick("color-picker")}>
              <i class="fas fa-caret-down"></i>
            </div>
          </div>
          <button onClick={() => this.onMenuClick("set-font-size")}>Set Size</button>
          <button onClick={() => this.onMenuClick("get-html")}>HTML</button>
          {/* <button onClick={() => this.getSelectedBlock()}>Get Selection block</button> */}
        </div>
      </Fragment>
    )
  }
}