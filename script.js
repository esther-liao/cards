//狀態機：遊戲狀態
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished"
};

//宣告變數：花色圖片
const Symbols = [
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png", // 黑桃
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png", // 愛心
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png", // 方塊
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png" // 梅花
];

//model資料模組
const model = {
  //被翻開的卡片
  revealedCards: [],
  //翻開的卡片一樣
  isRevealedCardsMatched() {
    return (
      this.revealedCards[0].dataset.index % 13 ===
      this.revealedCards[1].dataset.index % 13
    );
  },
  //分數
  score: 0,
  //次數
  triedTimes: 0
};

//View視覺呈現
const view = {
  // 1.製作卡片
  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`;
  },
  //2.製作卡片內容
  getCardContent(index) {
    //數字：
    const number = this.transformNumber((index % 13) + 1);
    //花色：
    const symbol = Symbols[Math.floor(index / 13)];
    return `
        <p>${number}</p>
        <img src="${symbol}">
        <p>${number}</p>
    `;
  },
  //3.特殊數字轉換
  transformNumber(number) {
    //switch語法
    switch (number) {
      case 1: //當 number 的值符合 case 1
        return "A"; //執行回傳 'A'
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        //當 number 的值都不符合上述條件
        return number; //執行回傳 number
    }
  },
  //4.渲染卡片
  displayCards(indexs) {
    //抓取節點#cards
    const rootElement = document.querySelector("#cards");
    rootElement.innerHTML = indexs
      .map((index) => this.getCardElement(index))
      .join("");
  },
  //5.翻牌
  flipCards(...cards) {
    cards.map((card) => {
      if (card.classList.contains("back")) {
        card.classList.remove("back");
        card.innerHTML = this.getCardContent(Number(card.dataset.index));
        return;
      }
      //回傳背面花色
      card.classList.add("back");
      card.innerHTML = null;
    });
  },
  //6.配對
  pairCards(...cards) {
    cards.map((card) => {
      card.classList.add("paired");
    });
  },
  //7.渲染分數
  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },
  //8.渲染次數
  renderTriedTimes(times) {
    document.querySelector(
      ".tried"
    ).textContent = `You've tried: ${times} times`;
  },
  //9.出現動畫
  appendWrongAnimation(...cards) {
    cards.map((card) => {
      card.classList.add("wrong");
      card.addEventListener(
        "animationend",
        (event) => event.target.classList.remove("wrong"),
        { once: true }
      );
    }); //once: true，是要求在事件執行一次之後，就要卸載這個監聽器
  },
  //顯示遊戲結束
  showGameFinished() {
    const div = document.createElement("div");
    div.classList.add("completed");
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `;
    const header = document.querySelector("#header");
    header.before(div);
  }
};

//controller控制
const controller = {
  //目前的狀態
  currentState: GAME_STATE.FirstCardAwaits,
  //產生卡片
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52));
  },
  //卡片配對及狀態
  dispatchCardAction(card) {
    if (!card.classList.contains("back")) {
      return;
    }
    switch (this.currentState) {
      //狀態一：等待翻第一張牌
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card);
        model.revealedCards.push(card);
        this.currentState = GAME_STATE.SecondCardAwaits;
        break;
      //狀態二：等待翻第二張牌
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes);
        view.flipCards(card);
        model.revealedCards.push(card);
        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          // 配對成功
          view.renderScore((model.score += 10));
          this.currentState = GAME_STATE.CardsMatched;
          view.pairCards(...model.revealedCards);
          model.revealedCards = [];
          //分數達到260
          if (model.score === 260) {
            console.log("showGameFinished");
            this.currentState = GAME_STATE.GameFinished;
            view.showGameFinished();
            return;
          }
          this.currentState = GAME_STATE.FirstCardAwaits;
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed;
          //失敗動畫
          view.appendWrongAnimation(...model.revealedCards);
          //時機停留1秒
          setTimeout(this.resetCards, 1000);
        }
        break;
    }
    console.log("this.currentState", this.currentState);
    console.log(
      "revealedCards",
      model.revealedCards.map((card) => card.dataset.index)
    );
  },
  //卡片重置
  resetCards() {
    view.flipCards(...model.revealedCards);
    model.revealedCards = [];
    controller.currentState = GAME_STATE.FirstCardAwaits;
  }
};

//外掛函式庫
const utility = {
  //洗牌
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys());
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index]
      ];
    }
    return number;
  }
};

//渲染卡片
controller.generateCards();

document.querySelectorAll(".card").forEach((card) => {
  //監聽器：卡片點擊
  card.addEventListener("click", (event) => {
    controller.dispatchCardAction(card);
  });
});