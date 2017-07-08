// 讀取 localStorage 購物車的 T-shirt 款式，轉成 json 物件陣列
function getShoppingCartListFromStorage() {
  var storage = localStorage;
  // 因為 localStorage 只能存字串，imgPath 類似
  // data:image/png;base64,iVBORw0KGgoAA...
  // 注意到 base64 後面是逗號，所以不能用逗號合併陣列為一個字串，所以用 join('%') 合併陣列
  // 所以儲存在 localStorage 的是像 a%b%c 這樣的字串，要把字串轉成陣列，用 .split('%')
  var stringArr = storage.getItem('shoppingCartList').split('%');
  // 再把字串陣列轉成 JSON 物件陣列
  var jsonArr = [];
  for(var i = 0; i < stringArr.length; i++) {
    jsonArr.push(JSON.parse(stringArr[i]));
  }
  return jsonArr;
}

/*
shoppingCartList 是 json 物件陣列，每一個元素都是像這樣的 json = {
imgPath: 'data:image/png;base64,iVBORw0KGgoAA...', <-- 把 canvas 存成圖檔
TShirtSize: 'M', <-- T-shirt 尺寸
price: 580, <-- 單價
count: 1 <-- 數量
}
*/
var shoppingCartList = getShoppingCartListFromStorage();
for(var i = 0; i < shoppingCartList.length; i++) {
  // i = 0 時，複製範本，修改後放到購物車，這樣就有兩個幾乎一樣的 html，所以 i = 1 時，就會選取兩個 html：原來的範本和你剛剛放到購物車的
  // 所以放入購物車前，移除 class template，畢竟它即將不再是範本
  var $list = $('div.template.shoppingCart.listItem')
  .clone()
  .removeClass('template');
  // lightbox 特效 Magnific Popup 讀取 <a> href 屬性，然後產生 img 來顯示圖片
  // 所以需要設定 <a>
  $('a.t-shirt.lightbox', $list).attr('href', shoppingCartList[i].imgPath);
  // 修改複製的範本中的 T-shirt 縮圖
  $('img.t-shirt.img-thumbnail', $list).attr('src', shoppingCartList[i].imgPath);
  // 修改複製的範本中的 T-shirt 尺寸
  $('span.t-shirt.size', $list).text(shoppingCartList[i].TShirtSize);
  // 修改複製的範本中的 T-shirt 單價
  $('span.t-shirt.price', $list).text(shoppingCartList[i].price);
  // 修改複製的範本中的 T-shirt 數量
  $('input.t-shirt.count', $list).val(shoppingCartList[i].count);
  // 修改複製的範本中的 T-shirt小計 = 單價 X 數量
  $('span.t-shirt.sum', $list)
  .text(getSum(i));
  // 然後加到購物車中
  $('#shoppingCartList').append($list);
}
// 購物車 T-shirt 截圖 lightbox 特效 Magnific Popup
// 套用特效在 #shoppingCartList 所包含的子元素
$('#shoppingCartList').magnificPopup({
  delegate: 'a.t-shirt.lightbox', // 點擊時觸發 lightbox 的子元素
  type: 'image', // 預設是 inline，而那樣不會如預期的顯示圖片在 lightbox 上
  gallery: { enabled: true } // 在 lightbox 中直接看購物車中其他的截圖，而不用先關閉 lightbox
});
// 顯示總計金額
$('span.t-shirt.total').text(getTotal());
// 計算索引值 i 那一列的小計
function getSum(i) {
  return shoppingCartList[i].price * shoppingCartList[i].count;
}
// 計算購物車中所有品項的總計金額
function getTotal() {
  var total = 0;
  for(var i = 0; i < shoppingCartList.length; i++) {
    total += getSum(i);
  }
  return total;
}
// 數量應該是正整數 1, 2, 3...，如果不是，就不能輸入
// 限制輸入數字 0, 1, 2 到 9，因為需要輸入 10 之類的數字，所以開放輸入 0
$('input.t-shirt.count').on('keypress', function(event) {
  if(event.which < 48 || event.which > 57) return false;
});
// 點選按鈕「修改數量」或「刪除」的那一列，改成全域變數
// 讓 $('button.remove', '#shoppingCartModalRemove') 內的 function 也可以存取
var $aRow = null;
/* 按鈕「修改數量」 */
$('button.t-shirt.update-count').click(function() {
  $aRow = $(this).parent().parent();
  // 讀取 t-shirt 數量，轉成整數
  var count = parseInt($aRow.find('input.t-shirt.count').val());

  // 如果輸入的 t-shirt 數量是 0，就顯示刪除確認
  if(count === 0) {
    $('#shoppingCartModalRemove').modal('show');
  } else { // 不是的話，就更新數量
    updateCount($aRow, count);
  }
});
// 把目前的購物車 json 物件陣列儲存到 localStorage
function setShoppingCartListToStorage() {
  // 把每一個 json 轉成字串
  var stringArr = [];
  for(var i = 0; i < shoppingCartList.length; i++) {
    stringArr.push(JSON.stringify(shoppingCartList[i]));
  }
  // 字串陣列用 % 合併為一個字串。因為 imgPath base64 後面是逗號
  //  儲存到 localStorage
  var storage = localStorage;
  storage.setItem('shoppingCartList', stringArr.join('%'));
}
/* 按鈕「移除」 */
$('button.t-shirt.remove').click(function() {
  // 選取是第幾列
  $aRow = $(this).parent().parent();
  $('#shoppingCartModalRemove').modal('show');
});
$('button.remove', '#shoppingCartModalRemove').click(function() {
  removeTShirt($aRow);
  // 隱藏確認刪除 modal
  $('#shoppingCartModalRemove').modal('hide');
});
function updateCount($aRow, count) {
  // 更新到 localStorage
  /*
  如果購物車上第二列的數量改成 2，並且更新到 localStorage(它是一個 json 陣列)。要找到
  json 陣列的第二個 json，修改其 count 數量為 2。問題是，怎麼知道點選的 button
  「修改數量」是在購物車清單上的第二列？答案是以下的程式碼。
  this 表示觸發 click 事件的按鈕，$(this).parent().parent() 是選取一整列，prevAll()
  選取之前的所有相鄰元素(同一層的)，所以在第二列觸發 click ，代表它的前面總共有一列，
  所以 length 為 1。而別忘了，第二列在陣列中的索引值是 1
  */
  var index = $aRow.prevAll().length;
  shoppingCartList[index].count = count;
  // 重新計算小計，更新頁面顯示
  $aRow.find('span.t-shirt.sum').text(getSum(index));
  // 更新總計金額
  $('span.t-shirt.total').text(getTotal());
  // 更新 localStorage
  setShoppingCartListToStorage();
}
function removeTShirt($aRow) {
  var index = $aRow.prevAll().length;
  // 刪除 json 物件陣列 shoppingCartList[index] 的 json 物件
  // splice(index, n)：刪除陣列中從索引值 index 開始的元素，共刪除 n 個
  shoppingCartList.splice(index, 1);
  // 更新總計金額
  $('span.t-shirt.total').text(getTotal());
  // 更新 localStorage
  setShoppingCartListToStorage();
  // 移除購物車上的這一列
  $aRow.remove();
}
