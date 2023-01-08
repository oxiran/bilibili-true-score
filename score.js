(async function () {

  // 获取平均分
  function getAverageScore(list) {
    const totalScore = list.reduce((total, current) => total + current, 0);
    return Math.round((totalScore / list.length) * 10) / 10;
  }

  // 获取评论列表
  async function getReviewList(type, id, cursor) {
    const url = `https://api.bilibili.com/pgc/review/${type}/list?media_id=${id}&ps=30&sort=0${cursor ? `&cursor=${cursor}` : ''}`;
    const response = await fetch(url, { method: 'GET' });
    const { data } = await response.json();
    return data;
  }

  // 获取分数列表
  function getScores(type, id) {
    return new Promise(async (resolve, reject) => {
      const scoreList = [];
      let cursor = undefined;

      while (true) {
        const { list, next } = await getReviewList(type, id, cursor);
        cursor = next;
        scoreList.push(...list.map((item) => item.score));
        if (cursor === 0) break;
      }

      resolve(scoreList);
    })
  }

  const mediaId = location.href.match(/media\/md(\d+)/)?.[1];
  if (!mediaId) {
    alert('请在 B 站评论列表页面使用该脚本!');
  }

  console.log('正在获取评分，请耐心等待...');
  const [shortScores, longScores] = await Promise.all([getScores('short', mediaId), getScores('long', mediaId)]);

  console.log(`长评共${longScores.length}条，平均分数为：${getAverageScore(longScores).toFixed(1)}`);
  console.log(`短评共${shortScores.length}条，平均分数为：${getAverageScore(shortScores).toFixed(1)}`);
  console.log('综合评分:', getAverageScore([...longScores, ...shortScores]).toFixed(1));
})();
