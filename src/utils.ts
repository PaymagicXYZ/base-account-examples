import { BasicOrderParameters } from "./types";

export function extractBasicOrderParameters(
  response: any
): BasicOrderParameters {
  const { parameters } = response.fulfillment_data.transaction.input_data;
  return {
    considerationToken: parameters.considerationToken,
    considerationIdentifier: parameters.considerationIdentifier,
    considerationAmount: parameters.considerationAmount,
    offerer: parameters.offerer,
    zone: parameters.zone,
    offerToken: parameters.offerToken,
    offerIdentifier: parameters.offerIdentifier,
    offerAmount: parameters.offerAmount,
    basicOrderType: parameters.basicOrderType,
    startTime: parameters.startTime,
    endTime: parameters.endTime,
    zoneHash: parameters.zoneHash,
    salt: parameters.salt,
    offererConduitKey: parameters.offererConduitKey,
    fulfillerConduitKey: parameters.fulfillerConduitKey,
    totalOriginalAdditionalRecipients:
      parameters.totalOriginalAdditionalRecipients,
    additionalRecipients: parameters.additionalRecipients,
    signature: parameters.signature,
  };
}
