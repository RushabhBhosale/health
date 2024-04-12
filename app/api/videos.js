import client from './client';

const endpoint = '/video';

const getCategories = () => client.get('/categorymaster');
const getAllVideos = (categoryId='All', pageNo=1) => client.get(endpoint + '/mobile/category?category_id='+categoryId+'&page='+pageNo);

export default {getCategories, getAllVideos};
