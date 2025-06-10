import { fetchData } from '../components/FetchData'; // Правильный импорт функции fetchData
export const logout = async () => {
  try {
    const token = localStorage.getItem('Token');
    const refreshToken = localStorage.getItem('refresh_token');

    if (token && refreshToken) {
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
      };

      const body = JSON.stringify({ refresh: refreshToken });

      // Вызов API для блокировки токена
      await fetchData('auth/logout/', 'POST', body, headers);
    }

    // Очистка локального хранилища в любом случае
    localStorage.clear();

    // Перенаправление на страницу входа
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout error:', error);

    // В случае ошибки всё равно очищаем хранилище
    localStorage.clear();
    window.location.href = '/login';
  }
};
