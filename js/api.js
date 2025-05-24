import { API_BASE_URL } from './config.js';

export async function sendScore(name, score) {
    try {
        const response = await fetch(`${API_BASE_URL}/scores/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: name, score: score }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ошибка HTTP: ${response.status}, сообщение: ${errorText}`);
        }

        const newScore = await response.json();
        console.log('Счет успешно отправлен:', newScore);
        return newScore;
    } catch (error) {
        console.error('Ошибка при отправке счета:', error);
        throw error;
    }
}