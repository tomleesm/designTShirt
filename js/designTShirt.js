// 背景白色，存成圖檔後背景才會是白色，不然預設是透明背景
// 即使背景圖片已去背，也能確保背景是白色的
var canvas = new fabric.Canvas('canvas', {
  width: 555, height: 555,
  backgroundColor: 'white'
});
// 選擇的 T-Shirt 顏色（背景圖片路徑）。
// 點選按鈕「清空」， T-shirt 應該是目前選取的顏色，而不是白色，所以用全域變數儲存選取的 T-shirt 背景圖片路徑
// 在選擇 T-shirt 顏色的程式碼中更改圖片路徑，然後在 #reset click 時做為引數傳入 setCanvasBackgroundImage()
var TShirtImgPath;
// 選擇的 T-shirt 尺寸，改成全域變數是為了方便傳給 TShirtStyle 變數
var TShirtSize = 'M'; // 使用者即使忘記選擇，也有預設值 M
// 點選連結「加入購物車」時，會把 T-shirt 的款式、尺寸、單價儲存到 json，再存到陣列
// shoppingCartList，然後存到 localStorage。為了在陣列中儲存不只一個 json 而使用全域變數
var shoppingCartList = getShoppingCartStorage();

function getShoppingCartStorage() {
  var storage = localStorage;
  // 抓取已經存在的購物車資料
  var existedData = storage.getItem('shoppingCartList');
  if(existedData) {
    // 儲存在 localStorage 的是像 a%b%c 這樣的字串，所以要把字串轉成陣列
    return existedData.split('%');
  }
  // localStorage 如果沒有資料，購物車預設就是空的
  return [];
}
// 設定背景是白色短袖 T-shirt，
setCanvasBackgroundImage(TShirtImgPath);

// 點選連結「存成圖檔」，把設計襯衫的編輯區畫面轉成 HTML 5 的 dataURL
// 並設為它的連結，這樣就會把設計結果存成圖檔
$('#downloadPic').on('click', function() {
  this.href = canvas.toDataURL('image/png');
});

// 預設初始配件清單和總價
var TShirtPrice =
{
  "TShirt": 250,
  "dec35Count": 0,
  "dec45Count": 0,
  "dec60Count": 0,
  "dec80Count": 0,
};
// 載入頁面時就先計算一次，以產生預設總計金額 250 元
calculatePrice(TShirtPrice);

// 當滑鼠點選後，配件圖片會出現在 canvas，並且呈現已選取的藍色標示
$('#decoration').on('click', 'img', function() {
  // this 是 <img src="img/decorations/35_1.png">
  // 圖片會出現在 canvas，表示圖片轉成 fabric.Image 物件
  // 從 this.src 讀取圖片路徑後，轉成 fabric.Image 物件 img
  // 在 fromURL() 中，this 會變成 window 物件，所以先在此存成變數
  var imgPath = this.src;
  fabric.Image.fromURL(imgPath, function(decoration) {
    // 新增配件到 canvas 之前，要先記錄配件的價格，
    // 稍後刪除配件時，才能知道即將刪除的物件價格，依此更新配件小計和總價
    decoration.price = getNewDecorationPrice(imgPath);
    // 如果剛加入的配件價格是 35，則 35 元的配件數量加一，以此類推
    decorationCountIncrease(decoration.price);
    // 更新右邊的配件清單和總價
    calculatePrice(TShirtPrice);
    // 更新完總價，然後加到 canvas
    canvas.add(decoration);
    // 設定 img 為 canvas 上唯一一個已選取的物件
    canvas.setActiveObject(decoration);
  });
});

function getNewDecorationPrice(imgPath) {
  //   抓取新增配件的價格
  //     如何知道加入的配件是 35, 45, 60 還是 80 元？依照圖片檔名判斷
  //     imgPath = http://localhost/designTShirt/img/decorations/35_1.png
  //     因為不知道前面的 domain name 會有多長，所以從後面尋找底線 _，直到 / 的字串就是配件價格
  var underline = imgPath.lastIndexOf('_'); // 從後面尋找底線第一次出現的索引值
  var slash = imgPath.lastIndexOf('/'); // 從後面尋找 / 第一次出現的索引值
  // 如果 domain name 是 localhost，則 slash 是 45，underline 是 48
  // 所以要從下一個索引值 46 取到索引值 48 的前一個
  // substring(start, end) 是從 start 取到 end - 1
  // parseInt: 把字串 35 轉成十進位整數，以方便之後的加總
  return parseInt(imgPath.substring(slash + 1, underline), 10);
}

function decorationCountIncrease(newDecorationPrice) {
  // 如果剛加入的配件價格是 35，則 35 元的配件數量加一，以此類推
  switch (newDecorationPrice) {
    case 35:
    TShirtPrice.dec35Count++; break;
    case 45:
    TShirtPrice.dec45Count++; break;
    case 60:
    TShirtPrice.dec60Count++; break;
    case 80:
    TShirtPrice.dec80Count++; break;
    default:
    $.error('unknown decoration price');
  }
}

function decorationCountDecrease(price) {
  //   如果刪除的是 35 元的配件，則 35 元配件數量扣掉 1
  switch (price) {
    case 35:
    TShirtPrice.dec35Count--; break;
    case 45:
    TShirtPrice.dec45Count--; break;
    case 60:
    TShirtPrice.dec60Count--; break;
    case 80:
    TShirtPrice.dec80Count--; break;
    // 加入文字和圖片是免費的
    case 0:
    break;
    default:
    $.error('unknown decoration price');
  }
}

function calculatePrice(TShirtPrice) {
  //   更新配件清單中配件的數量和小計
  // 總價 = T-shirt 價格 + 35 x 35 元配件數量 + 45 x 45 元配件數量 + 60 x 60 元配件數量 + 80 x 80 元配件數量
  var totalPrice = TShirtPrice.TShirt
  + 35 * TShirtPrice.dec35Count
  + 45 * TShirtPrice.dec45Count
  + 60 * TShirtPrice.dec60Count
  + 80 * TShirtPrice.dec80Count;
  // 更新 <div id="TShirtPrice"> 的配件清單和總價
  var $allPrice = $('#TShirtPrice').children();
  // 清單第一行：沒有配件的 T-shirt 價格
  var $TShirtPrice = $allPrice.eq(0);
  // 清單第二行：35 元配件的數量和小計，以此類推
  var $decoration35 = $allPrice.eq(1);
  var $decoration45 = $allPrice.eq(2);
  var $decoration60 = $allPrice.eq(3);
  var $decoration80 = $allPrice.eq(4);
  var $totalPrice   = $allPrice.eq(5);

  // $TShirtPrice 代表 <p>白色短袖 M 號 T-Shirt <br><span class="TShirt">250</span> 元</p>
  // 所以這一行是把其中的 class="TShirt" 的值改成 TShirtPrice.TShirt
  $TShirtPrice.children('.TShirt').text(TShirtPrice.TShirt);
  // $decoration35 代表 <p>35 元配件：35 X <span class="count">0</span> = <span class="sum">0</span></p>
  // 所以這是把 class="count" 的數字 0 改成 35 元配件的數量
  $decoration35.children('.count').text(TShirtPrice.dec35Count);
  // 所以這是把 class="sum" 的數字 0 改成 35 乘上 35 元配件的數量，以此類推
  $decoration35.children('.sum').text(35 * TShirtPrice.dec35Count);
  $decoration45.children('.count').text(TShirtPrice.dec45Count);
  $decoration45.children('.sum').text(45 * TShirtPrice.dec45Count);
  $decoration60.children('.count').text(TShirtPrice.dec60Count);
  $decoration60.children('.sum').text(60 * TShirtPrice.dec60Count);
  $decoration80.children('.count').text(TShirtPrice.dec80Count);
  $decoration80.children('.sum').text(80 * TShirtPrice.dec80Count);
  // $totalPrice 代表 <p>總價 <span class="totalPrice">0</span> 元
  $totalPrice.children('.totalPrice').text(totalPrice);
}

// 點選刪除按鈕，刪除選取的配件
$('#remove').click(function() {
  // 有選取物件，才執行刪除
  if(canvas.getActiveObject() != null) {
    remove();
  }
});

function remove() {
  // 更新配件小計和總價
  //   如果刪除的是 35 元的配件，則 35 元配件數量扣掉 1
  decorationCountDecrease(canvas.getActiveObject().price);
  //   再呼叫函式，重新計算價格表格即可
  calculatePrice(TShirtPrice);
  // 傳入目前選取的物件做為參數，然後刪除它
  canvas.remove(canvas.getActiveObject());
}
// modal 中的按鈕「加入文字」預設是禁用，只在有輸入文字時才能點選，確保不會產生空的 fabric.Text 物件
$('#textContent').on('keyup', function() {
  // 檢查輸入的文字不是全部為空白
  if ($.trim($(this).val()).length > 0) {
    // 按鈕「加入文字」取消禁用
    $('#addTextBtn').prop('disabled', false);
  } else {
    // 如果刪除輸入的字元，使得文字全部是空白字元之類的，就恢復禁用按鈕「加入文字」
    $('#addTextBtn').prop('disabled', true);
  }
});
// 點選 modal「加入文字」中的按鈕「使用陰影」，才顯示「陰影方向」和「陰影顏色」選項
$('#shadowEnable').on('click', function(event) {
  // 按鈕「使用陰影」用的是 bootstrap 文件 / javascript 中的 按鈕 / 單一切換
  // 點選時，class 有 active，未點選時則沒有，但是 event.target 卻是相反的結果，
  // 得到 button#shadowEnable.btn.btn-default.focus，而 this 卻是
  // <button type="button" id="shadowEnable" class="btn btn-default active" ...
  // 所以此時 $(this).hasClass('active') 得到 false，
  // 以至於 $(this).hasClass('active') 的左邊要加一個 NOT operator
  // 也許是因為這個 class active 是 click 事件發生後才加上去的，
  // 所以在 on() 之後 $('#shadowEnable').hasClass('active') 才會回傳 true
  // console.log(event.target);
  if( ! $(this).hasClass('active')) {
    // 「陰影方向」和「陰影顏色」選項顯示預設值「右下」、「黑色」
    initShadowPosition();
    initShadowColor();
    // 顯示「陰影方向」和「陰影顏色」選項
    $('#textShadowPositionOption').show();
    $('#textShadowColorOption').show();
  } else {
    // 隱藏「陰影方向」和「陰影顏色」選項
    $('#textShadowPositionOption').hide();
    $('#textShadowColorOption').hide();
  }
});

// 點選 modal 中的按鈕「加入文字」
$('#addTextBtn').click(function() {
  // 收集輸入的文字、選擇的字型、大小、粗細、顏色等
  // 產生 fabric.Text 物件
  var text = new fabric.Text($('#textContent').val(), {
    fontFamily: $('#fontFamily').val(),
    fontSize:   $('#fontSize').val(),
    // 選取 class 為 fontWeight 中已核取的元素，抓取表單值
    // class 選擇器的回傳值是 jQuery collection，即使只包含一個元素，也要用 first() 指定是群集中第一個元素
    fontWeight: $('.fontWeight:checked').first().val(),
    fill:     $('#textFill').val(),
    textAlign:  $('.textAlign:checked').first().val(),
    shadow: getTextShadowOption()
  });
  // 設定文字不能在 canvas 中調整大小，而是在 modal 中的選單選擇大小
  text.lockScalingX = true;
  text.lockScalingY = true;
  // 把剛剛選擇的表單值全部歸零，下一次點選按鈕「加入文字」時，才會從頭開始
  initTextOptions();
  // 然後關閉 modal
  $('#addTextModal').modal('hide');
  // 新增配件到 canvas 之前，要先記錄配件的價格，
  // 稍後刪除配件時，才能知道即將刪除的物件價格，依此更新配件小計和總價
  // 而加入文字是免費的，但是為了在之後能正常刪除物件，所以仍然加上 price = 0
  text.price = 0;
  // 加到 canvas
  canvas.add(text);
  // 並設為 canvas 上唯一一個已選取的物件
  canvas.setActiveObject(text);
});
// 點選 modal 中的按鈕「取消」，選項回到預設值
$('#addTextCancelBtn').click(function() {
  initTextOptions();
});
// 轉換文字陰影位置
// 1: 右下，2: 左上，3: 四周
function getTextShadowPosition() {
  // 注意：val() 回傳的是字串，不會自動轉成數字
  switch ($('.textShadowPosition:checked').first().val()) {
    case '1':
    return ' 5px 5px 5px';
    case '2':
    return ' -5px -5px 3px';
    case '3':
    return ' 0 0 5px';
    default:
    // 如果在 <input type="radio"> 加上 checked 設為預設值，會沒辦法選擇其他項目
    // 所以把 checked 都拿掉，在此設定 default 回傳的值做為預設值
    return ' 5px 5px 5px';
  }
}
// 抓取加入文字陰影選項
function getTextShadowOption() {
  // 如果點選按鈕「使用陰影」，fabric.Text 物件有陰影
  // 此時 hasClass('active') 得到 true
  if ($('#shadowEnable').hasClass('active')) {
    return $('#textShadowColor').val() + getTextShadowPosition();
  }

  return null;
}
function initTextOptions() {
  $('#textContent').val('');
  $('#fontFamily').val('Comic Sans MS');
  $('#fontSize').val('40');
  // 因為使用 bootstrap 按鈕群組，所以 radio 是否選擇，不是依靠 checked 決定，而是靠 label 的 class 是否有 active
  // 所以先把 <input type="radio" class="fontWeight"> 的上層 <label> 中的 active 都拿掉，然後選取第一個 label，在它的 class 中加入 active，表示其為預設值
  $('.fontWeight').parent('label').removeClass('active').first().addClass('active');
  $('#textFill').val('#000000');
  $('.textAlign').parent('label').removeClass('active').first().addClass('active');
  // 不點選按鈕「使用陰影」
  $('#shadowEnable').removeClass('active');
  // 隱藏「陰影方向」和「陰影顏色」選項
  $('#textShadowPositionOption').hide();
  $('#textShadowColorOption').hide();
  initShadowColor();
  initShadowPosition();
}
// 「陰影顏色」選項顯示預設值「黑色」
function initShadowColor() {
  $('#textShadowColor').val('#000000');
}
// 「陰影方向」選項顯示預設值「右下」
function initShadowPosition() {
  $('.textShadowPosition').parent('label').removeClass('active').first().addClass('active');
}
/*「加入圖片」 modal 的剪裁圖片設定 */
$(window).load(function() {
  var options =
  {
    thumbBox: '.thumbBox',
    spinner: '.spinner',
    imgSrc: 'avatar.png'
  };
  var cropper;
  $('#file').on('change', function() {
    var reader = new FileReader();
    reader.addEventListener('load', function(event) {
      options.imgSrc = event.target.result;
      cropper = $('.imageBox').cropbox(options);
    });
    reader.readAsDataURL(this.files[0]);
    this.files = [];
  });
  // 點選「加入圖片」modal 的按鈕「加入圖片」
  $('#addPicBtn').on('click', function() {
    // 把圖片轉成 fabric.Image 物件 pic
    fabric.Image.fromURL(cropper.getDataURL(), function(pic) {
      // 把 <input type="file"> 歸零，清除「裁剪圖片」區塊中剛載入的圖片
      resetCropbox();
      // 關閉 modal
      $('#addPicModal').modal('hide');
      // 把圖片裁剪成圓形
      pic.set({
        clipTo: function (ctx) {
          ctx.arc(0, 0, 100, 0, Math.PI * 2, true);
        }
      });
      // 新增配件到 canvas 之前，要先記錄配件的價格，
      // 稍後刪除配件時，才能知道即將刪除的物件價格，依此更新配件小計和總價
      // 而加入圖片是免費的，但是為了在之後能正常刪除物件，所以仍然加上 price = 0
      pic.price = 0;
      // 把圖片加到 canvas
      canvas.add(pic);
      // 設定剛剛新增的圖片為 canvas 上唯一一個已選取的物件
      canvas.setActiveObject(pic);
    });
  });
  $('#btnZoomIn').on('click', function() {
    cropper.zoomIn();
  });
  $('#btnZoomOut').on('click', function() {
    cropper.zoomOut();
  });
});

// 點選按鈕「加入圖片」以顯示 modal 時，要把 <input type="file"> 歸零，清除「裁剪圖片」區塊中剛載入的圖片
$('#showAddPicModalBtn').click(function() {
  resetCropbox();
});

// 把 <input type="file"> 歸零，清除「裁剪圖片」區塊中剛載入的圖片
function resetCropbox() {
  // 抓取「加入圖片」modal 中的「裁剪圖片」區塊 <div class="imageBox">
  // class 選擇器的回傳值是 jQuery collection，即使只包含一個元素，也要用 first() 指定是群集中第一個元素
  // 載入圖片後，<div class="imageBox"> 有許多 inline CSS屬性，例如 background-image, background-position 等 background 屬性，
  // 所以只要設定一個 background 屬性為空字串即可清除全部屬性
  $('.imageBox', '#addPicModal').first().css('background', '');
  $('#file').val('');
}

////////////////// 按鈕「清空」///////////////////////
$('#reset').on('click', function() {
  // 右邊的配件清單，配件數量設為零
  TShirtPrice.dec35Count = 0;
  TShirtPrice.dec45Count = 0;
  TShirtPrice.dec60Count = 0;
  TShirtPrice.dec80Count = 0;
  // 更新右邊的配件清單和總價
  calculatePrice(TShirtPrice);
  // 刪除加入的所有配件、文字和上傳的圖片
  canvas.clear();
  // canvas.clear() 會連背景 T-shirt 圖片也清掉，所以再把背景加回去
  setCanvasBackgroundImage(TShirtImgPath);
  // 關閉 modal
  $('#resetConfirmModal').modal('hide');
});

// renderAll() 的功用依照官方文件是 Renders both the top canvas and the secondary container canvas.
// 似乎是產生新的 canvas 做為容器、載入圖片，並設為背景
// 第二個參數是設定 Callback function，所以設定載入背景圖片後把兩個 canvas 繫結在一起
// 第三個參數是選項：
//  - 設定背景圖片的寬和高要和 canvas 一樣
//  - 設定背景圖片的位置對齊 canvas 左上方 0, 0 原點
function setCanvasBackgroundImage(bgImgPath) {
  // 預設值為白色 T-shirt
  if (bgImgPath == null) {
    bgImgPath = 'img/TShirts/white.jpg';
  }

  canvas.setBackgroundImage(
    bgImgPath,
    canvas.renderAll.bind(canvas),
    {
      width: canvas.width, height: canvas.height,
      originX: 'left', originY: 'top'
    }
  );
}
///////////////// 最上方選擇 T-shirt 顏色和尺寸 ////////////////
$('#TShirtColor').on('click', 'li', function() {
  // $li.children('span').attr('style') 得到字串 background:#fff
  // 所以用 substr() 抓取 fff。色碼為 3 個字元到 6 個字元，所以 substr() 取出長度 6
  // 用 $li.children('span').css('background') 會得到 rgb 值，還有一堆 no repeat 之類的數值，反而更難處理
  var $li = $(this);
  var color = $li.children('span').attr('style').substr(12, 6); // 色碼
  var chineseColorName = ''; // 顏色的中文名稱

  switch (color) {
    case 'fff':
    TShirtImgPath = 'img/TShirts/white.jpg';
    chineseColorName = '白';
    break;
    case 'ccc':
    TShirtImgPath = 'img/TShirts/gray.jpg';
    chineseColorName = '灰';
    break;
    case '000':
    TShirtImgPath = 'img/TShirts/black.jpg';
    chineseColorName = '黑';
    break;
    case '8f2941':
    TShirtImgPath = 'img/TShirts/wine.jpg'; // 酒紅
    chineseColorName = '酒紅';
    break;
    case 'd7504a':
    TShirtImgPath = 'img/TShirts/orange.jpg';
    chineseColorName = '橘';
    break;
    case '6d8175':
    TShirtImgPath = 'img/TShirts/green.jpg';
    chineseColorName = '草綠';
    break;
    case '2d4a76':
    TShirtImgPath = 'img/TShirts/navy.jpg'; // 海軍藍
    chineseColorName = '海軍藍';
    break;
    default:
    TShirtImgPath = 'img/TShirts/white.jpg';
    chineseColorName = '白';
  }
  // 依照取得的圖片路徑設定 canvas 背景
  setCanvasBackgroundImage(TShirtImgPath);
  // 清空之前選擇的 T-shirt 顏色標示
  $li.parent('ul').children('li').removeClass('active');
  // 標示目前選擇的 T-shirt 顏色，點選後維持藍色 border
  $li.addClass('active');
  // T-shirt 顏色選擇海軍藍，右邊顯示「海軍藍」色短袖
  $('#chineseColorName').text(chineseColorName);
});

$('#TShirtSize').on('click', 'li', function() {
  // 因為 <li>M</li>，所以 TShirtSize = 'M'
  var $li = $(this);
  TShirtSize = $li.text();
  // 清空之前選擇的 T-shirt 尺寸標示
  $li.parent('ul').children('li').removeClass('active');
  // 標示目前選擇的 T-shirt 尺寸，點選後維持藍色 border
  $li.addClass('active');
  // T-shirt 尺寸選擇 S，右邊顯示「 S 」號 T-Shirt
  $('span.t-shirt.size', '#TShirtPrice').text(TShirtSize);
});
///////////連結「加入購物車」和「結帳，共 n 種款式」/////////////
// 連結「加入購物車」
$('#addToShoppingCart').click(function() {
  /*
  點選連結後，建立 json = {
      imgPath: 'data:image/png;base64,iVBORw0KGgoAA...', <-- 把 canvas 存成圖檔
      TShirtSize: 'M', <-- T-shirt 尺寸
      price: 580 <-- 單價
   }
   因為 localStorage 只能存字串，所以用 JSON.stringify() 把 json 物件轉成字串
   */
   var aTShirtStyle = JSON.stringify({
     imgPath: canvas.toDataURL('image/png'),
     TShirtSize: TShirtSize,
     price: $('.totalPrice', '#TShirtPrice').first().text(), // class selector 回傳 collection，所以要用 first()
     count: 1 // T-shirt 數量預設 1
   });
   // 存到 localStorage
   // push(): 把引數儲存到陣列的尾端，並回傳陣列元素的個數
   shoppingCartList.push(aTShirtStyle);
   var storage = localStorage;
   // 因為 localStorage 只能存字串，aTShirtStyle.imgPath 類似
   // data:image/png;base64,iVBORw0KGgoAA...
   // 注意到 base64 後面是逗號，所以不能用逗號合併陣列為一個字串，也就不能用 toString()，所以用 join('%')
   storage.setItem('shoppingCartList', shoppingCartList.join('%'));
   // 顯示共幾種款式
   showTShirtStyleCount();
});
// 載入頁面時，右下角顯示目前購物車已經有幾種款式
showTShirtStyleCount();
// 右下方顯示共幾種款式
function showTShirtStyleCount() {
  var count = shoppingCartList.length;
  $('#showShoppingCart').children('.count').text(count);
}
