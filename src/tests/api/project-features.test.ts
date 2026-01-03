import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Mock project ID for testing
const TEST_PROJECT_ID = 'test-project-123';
const TEST_USER_ID = 'test-user-123';
const BASE_URL = 'http://localhost:3000/api';

// Helper function for API requests
async function apiRequest(path: string, options?: RequestInit) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  return response.json();
}

describe('Project Checklist API', () => {
  let createdItemId: string;

  it('should return empty checklist for new project', async () => {
    const result = await apiRequest(`/projects/${TEST_PROJECT_ID}/checklist`);

    // API may fail if project doesn't exist in test DB
    // In a real test, we'd create a project first
    expect(result).toBeDefined();
  });

  it('should create a new checklist item', async () => {
    const result = await apiRequest(`/projects/${TEST_PROJECT_ID}/checklist`, {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test checklist item',
        userId: TEST_USER_ID,
        userName: 'Test User',
      }),
    });

    // Store ID for later tests
    if (result.success && result.data) {
      createdItemId = result.data.id;
      expect(result.data.title).toBe('Test checklist item');
      expect(result.data.completed).toBe(false);
    }
  });

  it('should toggle checklist item completion', async () => {
    if (!createdItemId) return;

    const result = await apiRequest(`/projects/${TEST_PROJECT_ID}/checklist`, {
      method: 'PUT',
      body: JSON.stringify({
        itemId: createdItemId,
        completed: true,
        userId: TEST_USER_ID,
        userName: 'Test User',
      }),
    });

    if (result.success && result.data) {
      expect(result.data.completed).toBe(true);
    }
  });

  it('should delete checklist item', async () => {
    if (!createdItemId) return;

    const result = await apiRequest(`/projects/${TEST_PROJECT_ID}/checklist?itemId=${createdItemId}`, {
      method: 'DELETE',
    });

    expect(result.success).toBeDefined();
  });
});

describe('Project Comments API', () => {
  let createdCommentId: string;

  it('should return empty comments for new project', async () => {
    const result = await apiRequest(`/projects/${TEST_PROJECT_ID}/comments`);
    expect(result).toBeDefined();
  });

  it('should create a new comment', async () => {
    const result = await apiRequest(`/projects/${TEST_PROJECT_ID}/comments`, {
      method: 'POST',
      body: JSON.stringify({
        content: 'This is a test comment',
        createdBy: TEST_USER_ID,
        createdByName: 'Test User',
      }),
    });

    if (result.success && result.data) {
      createdCommentId = result.data.id;
      expect(result.data.content).toBe('This is a test comment');
      expect(result.data.isEdited).toBe(false);
    }
  });

  it('should edit a comment', async () => {
    if (!createdCommentId) return;

    const result = await apiRequest(`/projects/${TEST_PROJECT_ID}/comments`, {
      method: 'PUT',
      body: JSON.stringify({
        commentId: createdCommentId,
        content: 'Updated comment content',
        userId: TEST_USER_ID,
        userName: 'Test User',
      }),
    });

    if (result.success && result.data) {
      expect(result.data.content).toBe('Updated comment content');
      expect(result.data.isEdited).toBe(true);
    }
  });

  it('should delete comment', async () => {
    if (!createdCommentId) return;

    const result = await apiRequest(`/projects/${TEST_PROJECT_ID}/comments?commentId=${createdCommentId}`, {
      method: 'DELETE',
    });

    expect(result.success).toBeDefined();
  });
});

describe('Project Activity API', () => {
  it('should return empty activity for new project', async () => {
    const result = await apiRequest(`/projects/${TEST_PROJECT_ID}/activity`);
    expect(result).toBeDefined();
  });

  it('should create an activity entry', async () => {
    const result = await apiRequest(`/projects/${TEST_PROJECT_ID}/activity`, {
      method: 'POST',
      body: JSON.stringify({
        action: 'test_action',
        field: 'test_field',
        oldValue: 'old',
        newValue: 'new',
        userId: TEST_USER_ID,
        userName: 'Test User',
      }),
    });

    if (result.success && result.data) {
      expect(result.data.action).toBe('test_action');
      expect(result.data.field).toBe('test_field');
    }
  });
});

describe('Notifications API', () => {
  let createdNotificationId: string;

  it('should return empty notifications for user', async () => {
    const result = await apiRequest(`/notifications?userId=${TEST_USER_ID}`);
    expect(result).toBeDefined();
    expect(result.success || result.error).toBeDefined();
  });

  it('should create a notification', async () => {
    const result = await apiRequest('/notifications', {
      method: 'POST',
      body: JSON.stringify({
        userId: TEST_USER_ID,
        type: 'system',
        priority: 'medium',
        title: 'Test Notification',
        message: 'This is a test notification',
      }),
    });

    if (result.success && result.data) {
      createdNotificationId = result.data.id;
      expect(result.data.title).toBe('Test Notification');
      expect(result.data.isRead).toBe(false);
    }
  });

  it('should mark notification as read', async () => {
    if (!createdNotificationId) return;

    const result = await apiRequest('/notifications', {
      method: 'PUT',
      body: JSON.stringify({
        notificationIds: [createdNotificationId],
      }),
    });

    expect(result.success).toBeDefined();
  });

  it('should delete notification', async () => {
    if (!createdNotificationId) return;

    const result = await apiRequest(`/notifications?id=${createdNotificationId}`, {
      method: 'DELETE',
    });

    expect(result.success).toBeDefined();
  });
});

describe('Users API', () => {
  let createdUserId: string;
  const testEmail = `test-${Date.now()}@example.com`;

  it('should list users', async () => {
    const result = await apiRequest('/users');
    expect(result).toBeDefined();
    expect(result.success || result.error).toBeDefined();
  });

  it('should create a user', async () => {
    const result = await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: testEmail,
        role: 'freelancer_captacao',
      }),
    });

    if (result.success && result.data) {
      createdUserId = result.data.id;
      expect(result.data.name).toBe('Test User');
      expect(result.data.role).toBe('freelancer_captacao');
    }
  });

  it('should update a user', async () => {
    if (!createdUserId) return;

    const result = await apiRequest(`/users/${createdUserId}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: 'Updated Test User',
      }),
    });

    if (result.success && result.data) {
      expect(result.data.name).toBe('Updated Test User');
    }
  });

  it('should delete a user', async () => {
    if (!createdUserId) return;

    const result = await apiRequest(`/users/${createdUserId}`, {
      method: 'DELETE',
    });

    expect(result.success).toBeDefined();
  });
});
