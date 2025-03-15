import crypto from "crypto";
import type { AxiosResponse } from 'axios';

export function postTweet(
	text: string,
	replyToTweetId: string | null,
	_credentials: any
): Promise<AxiosResponse> {
	console.log('=== Mock Tweet ===');
	console.log('Text:', text);
	console.log('Reply to:', replyToTweetId);

	// Return a properly structured AxiosResponse
	return Promise.resolve({
		status: 201,
		statusText: 'Created',
		headers: {
			'content-type': 'application/json'
		},
		data: {
			data: {
				id: `mock-${crypto.randomUUID()}`,
				text: text
			}
		},
		config: {
			headers: {} // Minimum required property
		}
	} as unknown as AxiosResponse);
} 