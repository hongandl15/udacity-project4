import 'source-map-support/register'
import { updateTodo } from "../../businessLogic/todos";
import { createLogger } from "../../utils/logger";
import { getUserId } from "../utils";

const logger = createLogger('updateTodo');

export const handler = async (event) => {
  logger.info(`Update TODO: ${JSON.stringify(event)}`);
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

  const updatedTodo = JSON.parse(event.body);
  if (!updatedTodo) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify('Bad request')
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

  await updateTodo(userId, todoId, updatedTodo);

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify('')
  }
};