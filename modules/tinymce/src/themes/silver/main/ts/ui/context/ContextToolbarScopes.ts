/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { ValueSchema } from '@ephox/boulder';
import { InlineContent, Toolbar } from '@ephox/bridge';
import { Obj } from '@ephox/katamari';
import { ContextTypes } from '../../ContextToolbar';

// Divide the defined toolbars into forms, node scopes, and editor scopes
export interface ScopedToolbars {
  forms: Record<string, InlineContent.ContextForm>; // run through Bridge.
  inNodeScope: Array<ContextTypes>;
  inEditorScope: Array<ContextTypes>;
  lookupTable: Record<string, ContextTypes>;
  formNavigators: Record<string, Toolbar.ToolbarButtonSpec | Toolbar.ToolbarToggleButtonSpec>; // this stays API due to toolbar applying bridge
  groupNavigators: Record<string, Toolbar.ToolbarButtonSpec | Toolbar.ToolbarToggleButtonSpec>;
}

const categorise = (
  contextToolbars: Record<string, InlineContent.ContextFormSpec | InlineContent.ContextToolbarSpec | InlineContent.ContextToolbarGroupSpec>,
  navigate: (destForm: InlineContent.ContextForm | InlineContent.ContextToolbarGroup) => void
): ScopedToolbars => {

  // TODO: Use foldl/foldr and avoid as much mutation.
  const forms: Record<string, InlineContent.ContextForm> = { };
  const inNodeScope: Array<ContextTypes> = [ ];
  const inEditorScope: Array<ContextTypes> = [ ];
  const formNavigators: Record<string, Toolbar.ToolbarButtonSpec | Toolbar.ToolbarToggleButtonSpec> = { };
  const groupNavigators: Record<string, Toolbar.ToolbarButtonSpec | Toolbar.ToolbarToggleButtonSpec> = { }; // button vs tooglebutton?
  const lookupTable: Record<string, ContextTypes> = { };

  const registerForm = (key: string, toolbarSpec: InlineContent.ContextFormSpec) => {
    const contextForm = ValueSchema.getOrDie(InlineContent.createContextForm(toolbarSpec));
    forms[key] = contextForm;
    contextForm.launch.map((launch) => {
      // Use the original here (pre-boulder), because using as a the spec for toolbar buttons
      formNavigators['form:' + key + ''] = {
        ...toolbarSpec.launch,
        type: (launch.type === 'contextformtogglebutton' ? 'togglebutton' : 'button') as any,
        onAction: () => {
          navigate(contextForm);
        }
      };
    });

    if (contextForm.scope === 'editor') {
      inEditorScope.push(contextForm);
    } else {
      inNodeScope.push(contextForm);
    }

    lookupTable[key] = contextForm;
  };

  const registerGroup = (key: string, toolbarSpec: InlineContent.ContextToolbarGroupSpec) => {
    // groups[key] = ValueSchema.getOrDie(InlineContent.createContextToolbarGroup(toolbarSpec));
    groupNavigators[key] = {
      ...toolbarSpec, // change spec somewhat?
      type: 'button',
      onAction: () => {
        navigate(ValueSchema.getOrDie(InlineContent.createContextToolbarGroup(toolbarSpec))); // why getOrDie?
      }
    };
  };

  const registerToolbar = (key: string, toolbarSpec: InlineContent.ContextToolbarSpec) => {
    InlineContent.createContextToolbar(toolbarSpec).each((contextToolbar) => {
      if (toolbarSpec.scope === 'editor') {
        inEditorScope.push(contextToolbar);
      } else {
        inNodeScope.push(contextToolbar);
      }
      lookupTable[key] = contextToolbar;
    });
  };

  Obj.each(contextToolbars, (toolbarApi, key) => {
    switch (toolbarApi.type) {
      case 'contextform':
        registerForm(key, toolbarApi);
        break;

      case 'contexttoolbar':
        registerToolbar(key, toolbarApi);
        break;

      case 'contexttoolbargroup':
        registerGroup(key, toolbarApi);
    }
  });

  return {
    forms,
    inNodeScope,
    inEditorScope,
    lookupTable,
    formNavigators,
    groupNavigators
  };
};

export {
  categorise
};
