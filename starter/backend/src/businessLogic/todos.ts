import 'source-map-support/register';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '../utils/logger';
import {
    createTodoItem,
    deleteTodo,
    getTodoItem,
    getTodoItems,
    updateAttachmentUrl,
    updateTodoItem
} from '../dataLayer/todoAccess';
import { getAttachmentUrl, getUploadUrl } from '../fileStorage/attachmentUtils';

const logger = createLogger('todos');

export const getTodos = async (userId: string) => {
    logger.info(`Getting TODO items for user: ${userId}`);
    return getTodoItems(userId);
};

export const createTodo = async (userId: string, createTodoRequest: any) => {
    const todoId = uuidv4();
    const newTodoItem = {
        userId,
        todoId,
        createdAt: new Date().toISOString(),
        done: false,
        attachmentUrl: null,
        ...createTodoRequest
    };

    logger.info(`Creating TODO item ${todoId} for user ${userId}`, { data: newTodoItem });
    await createTodoItem(newTodoItem);
    return newTodoItem;
};

export const updateTodo = async (userId: string, todoId: string, updateTodoRequest: any) => {
    logger.info(`Updating TODO item ${todoId} for user ${userId}`);
    
    const item = await getTodoItem(todoId, userId);
    if (!item) throw new Error('TODO item not found');
    if (item.userId !== userId) throw new Error('User is not authorized to update this TODO item');

    await updateTodoItem(todoId, updateTodoRequest);
};

export const deleteTodoItem = async (userId: string, todoId: string) => {
    logger.info(`Deleting TODO item ${todoId} for user ${userId}`);
    
    const item = await getTodoItem(todoId, userId);
    if (!item) throw new Error('TODO item not found');
    if (item.userId !== userId) throw new Error('User is not authorized to delete this TODO item');

    await deleteTodo(todoId, userId);
};

export const updateTodoAttachmentUrl = async (userId: string, todoId: string, attachmentId: string) => {
    logger.info(`Generating attachment URL for attachment ${attachmentId}`);
    
    const attachmentUrl = await getAttachmentUrl(attachmentId);
    const item = await getTodoItem(todoId, userId);
    
    if (!item) throw new Error('TODO item not found');
    if (item.userId !== userId) throw new Error('User is not authorized to update this TODO item');

    await updateAttachmentUrl(userId, todoId, attachmentUrl);
};

export const generateUploadUrl = async (attachmentId: string) => {
    logger.info(`Generating upload URL for attachment ${attachmentId}`);
    return getUploadUrl(attachmentId);
};
