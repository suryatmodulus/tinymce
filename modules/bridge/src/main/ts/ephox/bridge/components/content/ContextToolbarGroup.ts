import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';
import { BaseToolbarButton, BaseToolbarButtonInstanceApi, BaseToolbarButtonSpec } from '../toolbar/ToolbarButton';
import {
  BaseToolbarToggleButton, BaseToolbarToggleButtonInstanceApi, BaseToolbarToggleButtonSpec
} from '../toolbar/ToolbarToggleButton';
import { ContextBar, contextBarFields, ContextBarSpec } from './ContextBar';

export interface ContextFormLaunchButtonApi extends BaseToolbarButtonSpec<BaseToolbarButtonInstanceApi> {
  type: 'contextformbutton';
}

export interface ContextFormLaunchButton extends BaseToolbarButton<BaseToolbarButtonInstanceApi> {
  type: 'contextformbutton';
}

export interface ContextFormLaunchToggleButtonSpec extends BaseToolbarToggleButtonSpec<BaseToolbarToggleButtonInstanceApi> {
  type: 'contextformtogglebutton';
}

export interface ContextFormLaunchToggleButton extends BaseToolbarToggleButton<BaseToolbarToggleButtonInstanceApi> {
  type: 'contextformtogglebutton';
}

// tslint:disable-next-line:no-empty-interface
export interface ContextFormButtonInstanceApi extends BaseToolbarButtonInstanceApi {

}

// tslint:disable-next-line:no-empty-interface
export interface ContextFormToggleButtonInstanceApi extends BaseToolbarToggleButtonInstanceApi {

}

export interface ContextFormButtonSpec extends BaseToolbarButtonSpec<ContextFormButtonInstanceApi> {
  type?: 'contextformbutton';
  primary?: boolean;
  onAction: (formApi: ContextFormInstanceApi, api: ContextFormButtonInstanceApi) => void;
}

export interface ContextFormToggleButtonSpec extends BaseToolbarToggleButtonSpec<ContextFormToggleButtonInstanceApi> {
  type?: 'contextformtogglebutton';
  onAction: (formApi: ContextFormInstanceApi, buttonApi: ContextFormToggleButtonInstanceApi) => void;
  primary?: boolean;
}

export interface ContextFormButton extends BaseToolbarButton<ContextFormButtonInstanceApi> {
  type?: 'contextformbutton';
  primary?: boolean;
  onAction: (formApi: ContextFormInstanceApi, buttonApi: ContextFormButtonInstanceApi) => void;
  original: ContextFormButtonSpec;
}

export interface ContextFormToggleButton extends BaseToolbarToggleButton<ContextFormToggleButtonInstanceApi> {
  type?: 'contextformtogglebutton';
  primary?: boolean;
  onAction: (formApi: ContextFormInstanceApi, buttonApi: ContextFormToggleButtonInstanceApi) => void;
  original: ContextFormToggleButtonSpec;
}

export interface ContextFormInstanceApi {
  hide: () => void;
  getValue: () => string; // Maybe we need to support other data types?
}

export interface ContextToolbarGroupSpec extends ContextBarSpec {
  type?: 'contexttoolbargroup';
  items: string;
  icon?: string;
  // More? See ToolbarButton.ts
}

export interface ContextToolbarGroup extends ContextBar {
  type: 'contexttoolbargroup';
  initValue: () => string;
  items: string;
  label: Optional<string>;
  launch: Optional<ContextFormLaunchButton | ContextFormLaunchToggleButton>;
  commands: Array<ContextFormToggleButton | ContextFormButton>;
}

const contextToolbarGroupSchema = ValueSchema.objOf([
  FieldSchema.defaulted('type', 'contexttoolbargroup'),
  FieldSchema.strictString('items'),
  FieldSchema.optionString('icon'),
].concat(contextBarFields));

export const createContextToolbarGroup = (spec: ContextToolbarGroupSpec): Result<ContextToolbarGroupSpec, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<ContextToolbarGroupSpec>('ContextToolbarGroupSchemaSpec', contextToolbarGroupSchema, spec);
