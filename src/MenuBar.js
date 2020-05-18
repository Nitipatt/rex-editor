import React, { Fragment } from "react";
import "./scss/MenuBar.scss";
import "./scss/fontawesome/css/all.min.css"
import { ChromePicker } from "react-color";
export default class MenuBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showColorPicker: false,
      showHeadingPicker: false,
      showFontSizePicker: false
    }
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  setRef = (refName,node) => {
    this[refName] = node;
  }

  handleClickOutside = (event) => {
    if (this.colorRef && !this.colorRef?.contains(event.target) && !(event.target.classList.contains('color-picker-dropdown'))) {
      this.setState({showColorPicker: false})
    }
    if (this.headingRef && !this.headingRef?.contains(event.target) && !(event.target.classList.contains('heading-picker-dropdown'))) {
      this.setState({showHeadingPicker: false})
    }
    if (this.fontSizeRef && !this.fontSizeRef?.contains(event.target) && !(event.target.classList.contains('font-size-picker-dropdown'))) {
      this.setState({showFontSizePicker: false})
    }
  }
  
  onMenuClick = (command, value = undefined) => {
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
      case "heading-picker":
        return this.setState({ showHeadingPicker: !this.state.showHeadingPicker })
      case "font-size-picker":
        return this.setState({ showFontSizePicker: !this.state.showFontSizePicker })
      case "set-color":
        return this.props.funcProps.activeStyle("color")
      case "get-html":
        return this.props.funcProps.getHTML()
      case "set-font-size":
        this.setState({showFontSizePicker: false})
        return this.props.funcProps.activeStyle("fontSize")
      case "set-heading":
        this.setState({showHeadingPicker: false})
        return this.props.funcProps.setHeading(value); 
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
      {
        name: 'get-html',
        icon: 'fas fa-code' 
      },
    ]
    const fontSize = [10,12,14,16,18,20,22,24,26,28,36,48,72]
    return (
      <Fragment>
        <div className="menu-bar">
          {
            this.state.showColorPicker ? (
              <div
                className="color-picker"
                ref={(node)=>this.setRef('colorRef',node)}
              >
                <ChromePicker
                  color={this.props.style.color}
                  disableAlpha ={true}
                  onChangeComplete={(color) => {
                    this.props.funcProps.setStyleState("color", color.hex);
                  }}
                />
              </div>
            ) : ''
          }
          <div className="icon-btn heading-picker-dropdown" onClick={() => this.onMenuClick('heading-picker')}>
            <i className='fas fa-heading heading-picker-dropdown'></i>
          </div>
          {
            this.state.showHeadingPicker ? 
            <div className='heading-picker' ref={(node)=>this.setRef('headingRef',node)}>
              {[1,2,3,4,5,6].map((head) => {
                return ( 
                <div key={`heading-${head}`} className="icon-btn heading" onClick={() => this.onMenuClick('set-heading',head)}>
                  <i className='fas fa-heading'></i><span className="heading-text">{head}</span>
                </div>)
              })}            
            </div>: ''
          }
          <div className="icon-btn font-size-picker-dropdown" onClick={() => this.onMenuClick('font-size-picker')}>
            <i className='fas fa-font font-size-picker-dropdown'></i><span className="lower-a">a</span>
          </div>
          {
            this.state.showFontSizePicker ? 
            <div className='font-size-picker' ref={(node)=>this.setRef('fontSizeRef',node)}>
              {fontSize.map((size) => {
                return ( 
                <div key={`fontSize-${size}`} className="icon-btn font-size" onClick={() => this.onMenuClick('set-font-size',size)}>
                  <i className='fas fa-font-size'></i><span className="font-size-text">{size}</span>
                </div>)
              })}            
            </div>: ''
          } 
          <div className="icon-btn" onClick={() => this.onMenuClick("set-color")}>
            <div className='show-color' style={{backgroundColor: this.props.style.color}}></div>
            <i className='fas fa-font'></i>
            <div className='drop-down color-picker-dropdown' onClick={() => this.onMenuClick("color-picker")}>
              <i className="fas fa-caret-down color-picker-dropdown"></i>
            </div>
          </div>
          {
            menuList.map(item=>this.renderButton(item.icon, item.name))
          }
          {/* <button onClick={() => this.getSelectedBlock()}>Get Selection block</button> */}
        </div>
      </Fragment>
    )
  }
}