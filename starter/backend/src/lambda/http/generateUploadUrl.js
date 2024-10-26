import 'source-map-support/register'
import { generateUploadUrl, updateTodoAttachmentUrl } from "../../businessLogic/todos";
import { createLogger } from "../../utils/logger";
import { getUserId } from "../utils";
import * as uuid from 'uuid'

const logger = createLogger('generateUploadUrl');

export const handler = async (event) => {
  logger.info(`Generate upload URL: ${JSON.stringify(event)}`);

  const todoId = event.pathParameters.todoId;
  if (!todoId) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify('todo Id is not found')
    };
  }

  const userId = getUserId(event);
  if (!userId) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify('User Id is not found')
    };
  }

  const attachmentId = uuid.v4();

  const url = await generateUploadUrl(attachmentId);

  await updateTodoAttachmentUrl(userId, todoId, attachmentId);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl: url
    })
  }
};