import React from 'react';
// import { render } from '@testing-library/react';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, configure } from 'enzyme';
import RexEditor from '../RexEditor';

configure({adapter: new Adapter()});
// test('renders learn react link', () => {
//   const { getByText } = render(<App />);
//   const linkElement = getByText(/learn react/i);
//   expect(linkElement).toBeInTheDocument();
// });

test('button to command', () => {
  const wrapper = shallow(<RexEditor></RexEditor>)
  const instance = wrapper.instance()
  expect(instance.onMenuClick('bold')).toEqual('handled')
})
