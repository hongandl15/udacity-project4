import 'source-map-support/register'
import { createTodo } from "../../businessLogic/todos";
import { createLogger } from "../../utils/logger";
import { getUserId } from "../utils";

const logger = createLogger('createTodo');

export const handler = async (event) => {
  logger.info(`createTodo: ${JSON.stringify(event)}`);

  const newTodo = JSON.parse(event.body);
  if (!newTodo) {
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

  const newTodoItem = await createTodo(userId, newTodo);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: newTodoItem
    })
  }
};