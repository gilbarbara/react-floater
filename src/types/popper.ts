import { Instance, Placement } from '@popperjs/core';
import { ApplyStylesModifier } from '@popperjs/core/lib/modifiers/applyStyles';
import { ArrowModifier } from '@popperjs/core/lib/modifiers/arrow';
import { ComputeStylesModifier } from '@popperjs/core/lib/modifiers/computeStyles';
import { EventListenersModifier } from '@popperjs/core/lib/modifiers/eventListeners';
import { FlipModifier } from '@popperjs/core/lib/modifiers/flip';
import { HideModifier } from '@popperjs/core/lib/modifiers/hide';
import { OffsetModifier } from '@popperjs/core/lib/modifiers/offset';
import { PopperOffsetsModifier } from '@popperjs/core/lib/modifiers/popperOffsets';
import { PreventOverflowModifier } from '@popperjs/core/lib/modifiers/preventOverflow';

export type PopperInstance = Instance;
export type PopperPlacement = Placement;

export interface PopperModifiers {
  applyStyles?: Partial<ApplyStylesModifier>;
  arrow?: Partial<ArrowModifier>;
  computeStyles?: Partial<ComputeStylesModifier>;
  eventListeners?: Partial<EventListenersModifier>;
  flip?: Partial<FlipModifier>;
  hide?: Partial<HideModifier>;
  offset?: Partial<OffsetModifier>;
  popperOffsets?: Partial<PopperOffsetsModifier>;
  preventOverflow?: Partial<PreventOverflowModifier>;
}
