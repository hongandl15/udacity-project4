import 'source-map-support/register'
import { deleteTodoItem } from "../../businessLogic/todos";
import { createLogger } from "../../utils/logger";
import { getUserId } from "../utils";

const logger = createLogger('deleteTodo');

export const handler = async (event) => {
  logger.info(`deleteTodo: ${JSON.stringify(event)}`);

  const todoId = event.pathParameters.todoId;
  if (!todoId) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify('todoId is not found')
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
      body: JSON.stringify('user Id is not found')
    };
  }

  await deleteTodoItem(userId, todoId);

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify('')
  }
};