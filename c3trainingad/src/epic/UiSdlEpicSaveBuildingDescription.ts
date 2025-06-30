import { ofType } from 'redux-observable';
import { mergeMap } from 'rxjs/operators';
import { of, concat } from 'rxjs';
import { ImmutableReduxState } from '@c3/ui/UiSdlConnected';
import { getFormFieldValuesFromState } from '@c3/ui/UiSdlForm';
import { ajax, requestDataAction } from '@c3/ui/UiSdlDataRedux';
import { openCloseModalAction } from '@c3/ui/UiSdlModal';

/* eslint-disable import/prefer-default-export */

export function epic(actionStream: any, _stateStream: any) {
  return actionStream.pipe(
    mergeMap(function (action: any) {
      console.log("Epic triggered");
      const state = _stateStream.value as ImmutableReduxState;
      const formId = action.payload.formId;
      const modalId = action.payload.modalId; // Modal ID to close after saving
      const dataSourceId = action.payload.dataSourceId;

      // Get the form data
      const formData = getFormFieldValuesFromState(formId, state);
      const { buildingId, description } = formData;

      if (!buildingId || !description) {
        return null;
      }

      // Update the building description in the database
      return ajax('Building', 'merge', {
        this: { id: buildingId, description: description }
      }).pipe(
        mergeMap(function (_event) {
          // Close the modal after updating
          return concat(
            of({
              type: 'SmartBulb.UpdateBuildingDetails.BUILDING_UPDATE_SUCCESS',
              payload: {
                componentId: 'SmartBulb.SuccessBanner'
              }
            }),
            of(openCloseModalAction(modalId, false)),
            of(requestDataAction(dataSourceId))
          );
        })
      );
    })
  );
}