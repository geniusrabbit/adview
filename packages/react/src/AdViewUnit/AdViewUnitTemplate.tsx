//
// Example
// <AdView.Unit>
//   <AdView.Template type="banner">
//     <...>
//   </AdView.Template>
// </AdView.Unit>
//

import React, { JSX } from 'react';
import { AdLoadState, AdViewUnitClientChildrenProps, AdViewUnitTemplateProps, AdViewUnitTemplateTypeProps } from '../types';
import { matchExpectedState } from './utils';

// TemplateListRender is a function that takes a list of TemplateType and returns a React element
export type TemplateListRender = (tmpls: TemplateElement[]) => React.ReactElement | JSX.Element;

// TemplateType is a React component that can be used to render ad templates
export type TemplateType = React.Component<AdViewUnitTemplateProps>;
export type TemplateElement = React.ReactElement<AdViewUnitTemplateProps>;

// TemplateTypeFunction is a function that takes AdViewUnitTemplateTypeProps and returns a React node or element
export type TemplateTypeFunction = (props: AdViewUnitTemplateTypeProps) => React.ReactNode | React.ReactElement;

// templateFromListRender is a function that takes a list of TemplateType and returns a React element
export const templateFromListRender = (tmpls: TemplateElement[], data: AdViewUnitTemplateTypeProps, wrap?: (children: React.ReactNode) => React.ReactNode): JSX.Element | React.ReactElement => {
  let renderedRemplates = tmpls.map((tmpl, index) => {
    let tmp = renderTemplate(tmpl, data);
    return !!tmp && React.isValidElement(tmp)
      ? <React.Fragment key={index}>{!!wrap ? wrap(tmp) : tmp}</React.Fragment>
      : null;
  }).filter(it => !!it);

  if (!renderedRemplates.length) {
    renderedRemplates = tmpls.map((tmpl, index) => {
      let tmp = renderTemplate(tmpl, {...data, type: 'default'});
      return !!tmp && React.isValidElement(tmp)
        ? <React.Fragment key={index}>{!!wrap ? wrap(tmp) : tmp}</React.Fragment>
        : null;
    }).filter(it => !!it);
  }

  return (<>{renderedRemplates}</>);
};

// renderTemplate is a function that takes a TemplateType or a function and returns a React node
export const renderTemplate = (tmpl: TemplateElement | TemplateTypeFunction, data: AdViewUnitTemplateTypeProps): React.ReactNode => {
  const isFunction = typeof tmpl === 'function';
  const isReactElement = React.isValidElement(tmpl);

  if (isReactElement) {
    // Extract type and children from the React element
    let { type, children } = tmpl.props;
    if (!type && typeof tmpl.type !== 'string') {
      type = (tmpl.type as any)?.defaults?.type;
    }
    // If the type does not match, return null
    if (!!type && type !== '*' && data.type !== type) {
      return null;
    }
    // If children is a function, call it with the data
    if (typeof children === 'function') {
      return children(data as AdViewUnitClientChildrenProps);
    }
    // If children is a React element, clone it with the new props
    return React.cloneElement((tmpl as TemplateElement), {
      ...data,
      children: children,
    });
  }

  if (isFunction) {
    return tmpl(data);
  }

  return null;
}

// renderTemplates is a function that takes a list of TemplateType and returns a React element
export const renderTemplates = (tmpls: TemplateElement[], data: AdViewUnitTemplateTypeProps, listRender?: TemplateListRender): React.ReactNode | React.ReactElement | JSX.Element => {
  return listRender ? listRender(tmpls) : templateFromListRender(tmpls, data);
};

export const renderAnyTemplates = (tmpls: any, data: AdViewUnitTemplateTypeProps, listRender?: TemplateListRender): React.ReactNode | React.ReactElement | JSX.Element | null => {
  if (!tmpls) {
    return null;
  }

  if (Array.isArray(tmpls)) {
    return renderTemplates(tmpls as TemplateElement[], data, listRender);
  }

  if (typeof tmpls === 'function') {
    return tmpls(data);
  }

  if (React.isValidElement(tmpls)) {
    return templateFromListRender([tmpls as TemplateElement], data);
  }

  return null;
}

// Template is a React component that renders a template based on the type and data provided
// Example usage:
// <AdView.Unit>
//   <AdView.Template type="banner" data={{...}}>
// </AdView.Unit>
const AdViewUnitTemplate = ({ type, state, children, ...props }: AdViewUnitTemplateProps) => {
  const tmplProps: AdViewUnitTemplateTypeProps = {
    type,
    state,
    ...props,
  };
  
  const expectState: AdLoadState =
    (props?.isInitial || props?.isLoading || props?.isError || props?.isComplete) ? {
      isInitial: props?.isInitial,
      isLoading: props?.isLoading,
      isError: props?.isError,
      isComplete: props?.isComplete
    } : {isComplete: true};

  // Check if the expected state matches the current state
  if (!matchExpectedState(expectState, state)) {
    return null;
  }

  // If children is a function, call it with the data
  if (typeof children === 'function') {
    return children(tmplProps as AdViewUnitClientChildrenProps) as React.ReactElement;
  }

  // If children is a React element, clone it with the new props
  if (React.isValidElement(children)) {
    return React.cloneElement(children, tmplProps);
  }

  // If no children are provided, return an empty fragment
  return <></>;
}

export default AdViewUnitTemplate;
