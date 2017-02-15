var JDMBanner = (function(){
  function JDMBanner(containerJDMBanner,frameObj,timelineObj){
    JDMBanner.scope = this;

    this.containerJDMBanner = containerJDMBanner;
    this.frameData = frameObj;
    this.timelineData = timelineObj;
    this.dataJDMBanner;

    this.arrayFrames = [];
    this.arrayElements = [];

    this.imgPath = 'assets/img/';
    this.counterImg = 0;
    this.totalImg = 0;

    this.iteration = 0;
    this.numTween = 0;
    this.lastLabelName;

    this.configureJDMBanner();
    this.addListeners();
  }

  JDMBanner.prototype.configureJDMBanner = function(){
    this.dataJDMBanner = {
      width: this.containerJDMBanner.getAttribute('data-w'),
      height: this.containerJDMBanner.getAttribute('data-h'),
      bgColor: this.containerJDMBanner.getAttribute('data-bg-color'),
      border: this.containerJDMBanner.getAttribute('data-border'),
      preload: this.containerJDMBanner.getAttribute('data-preload'),
      cover: this.containerJDMBanner.getAttribute('data-cover')
    }

    /* SET MAIN STYLES */

    this.containerJDMBanner.style.width = this.dataJDMBanner.width + 'px';
    this.containerJDMBanner.style.height = this.dataJDMBanner.height + 'px';
    this.containerJDMBanner.style.backgroundColor = this.dataJDMBanner.bgColor;
    this.containerJDMBanner.style.border = this.dataJDMBanner.border;

    /* SET COVER */

    if(this.dataJDMBanner.cover == "true") {
      var divCover = document.createElement('div');
      divCover.style.backgroundColor = this.dataJDMBanner.bgColor;
      divCover.style.zIndex = 2;
      divCover.setAttribute('id','cover');
      this.containerJDMBanner.appendChild(divCover);
    }

    /* SET FRAMES */

    var totalFrames = 0;
    var arrayIdFrames = [];

    for(var items in this.frameData){
      this.arrayElements.push(this.frameData[items]);
      arrayIdFrames.push(items.toString());
      totalFrames++;
    };

    for (var i = 0; i < totalFrames; i++) {
      this.totalImg += this.arrayElements[i].length;
    };

    for (var ii = 0; ii < totalFrames; ii++) {
      var divTemp = document.createElement('div');
      divTemp.classList.add('frame');
      divTemp.setAttribute('id',arrayIdFrames[ii]);
      //divTemp.setAttribute('id','frame' + (ii+1));
      this.containerJDMBanner.appendChild(divTemp);
      this.arrayFrames.push(divTemp);

      this.setImgs(this.arrayFrames[ii],this.arrayElements[ii]);
    };
  };

  JDMBanner.prototype.setImgs = function(frameSelected,elementsSelected){
    elementsSelected.forEach(function(i){
      var imgTemp = new Image();
      imgTemp.src = JDMBanner.scope.imgPath + i;
      frameSelected.appendChild(imgTemp);
      var pointerCut = i.indexOf(".");
      var stringSelected = i.substr(0,pointerCut);
      imgTemp.setAttribute('id',stringSelected);
      imgTemp.onload = JDMBanner.scope.imgLoaded();
    });
  };

  JDMBanner.prototype.imgLoaded = function(){
    JDMBanner.scope.counterImg++;
    if(JDMBanner.scope.counterImg == JDMBanner.scope.totalImg) {
      JDMBanner.scope.createTimeLine();
    };
  };

  JDMBanner.prototype.createTimeLine = function(){

    /* CREATE TIMELINE */

    JDMBanner.scope.tl = new TimelineMax();
    JDMBanner.scope.tl.paused(true);

    /* SET TIMELINE */

    JDMBanner.scope.timelineData.arrayTween.forEach(function(i){
      JDMBanner.scope.numTween++;
      JDMBanner.scope.tl.addLabel('step_' + JDMBanner.scope.numTween);
      switch(i.type){
        case 'set':
          JDMBanner.scope.tl.add(TweenMax.set(i.id, i.prop),i.delay);
        break;
        case 'to':
          JDMBanner.scope.tl.add(TweenMax.to(i.id, i.time, i.prop),i.delay);
        break;
        case 'from':
          JDMBanner.scope.tl.add(TweenMax.from(i.id, i.time, i.prop),i.delay);
        break;
        case 'fromTo':
          JDMBanner.scope.tl.add(TweenMax.fromTo(i.id, i.time, i.propInit, i.propEnd),i.delay);
        break;
        case 'call':
          JDMBanner.scope.tl.add(TweenMax.call(i.callBackFunction),i.delay);
        break;
      }
    });

    JDMBanner.scope.tl.addCallback(
      function(){JDMBanner.scope.endTimeLine(JDMBanner.scope.timelineData.loopIteration, JDMBanner.scope.timelineData.loopLabelInit)}
    );

    if(JDMBanner.scope.timelineData.initLabel == undefined || JDMBanner.scope.timelineData.initLabel == false) JDMBanner.scope.tl.resume(0);
    else JDMBanner.scope.tl.resume(JDMBanner.scope.timelineData.initLabel);

    if(JDMBanner.scope.timelineData.addPauseAt == undefined || JDMBanner.scope.timelineData.addPauseAt == false) {
      console.log('addPause undefined');
    } else {
      console.log('addPause defined');
      JDMBanner.scope.addPauseAt(JDMBanner.scope.timelineData.addPauseAt);
    }
  };

  JDMBanner.prototype.endTimeLine = function(numRepeat, label){
    if(numRepeat < 2) return;
    if(numRepeat == -1 || numRepeat == undefined) {
      JDMBanner.scope.tl.resume(0);
    } else{
      JDMBanner.scope.iteration++;
      if(numRepeat > 1 && JDMBanner.scope.iteration == numRepeat - 1) {
        var lastLabel;
        if(JDMBanner.scope.timelineData.loopLabelEnd == undefined || JDMBanner.scope.timelineData.loopLabelEnd == false) {
          lastLabel = JDMBanner.scope.tl.getLabelsArray()[JDMBanner.scope.tl.getLabelsArray().length-1];
          JDMBanner.scope.lastLabelName = lastLabel.name;
        } else {
          lastLabel = JDMBanner.scope.timelineData.loopLabelEnd;
          console.log(lastLabel)
          JDMBanner.scope.lastLabelName = lastLabel;
        }
        JDMBanner.scope.tl.addPause(JDMBanner.scope.lastLabelName);
      }
      if(JDMBanner.scope.iteration == numRepeat) return;
    }
    label != undefined || label == false ? JDMBanner.scope.tl.resume(label) : JDMBanner.scope.tl.resume(0);
  };

  JDMBanner.prototype.addPauseAt = function(label){
    JDMBanner.scope.tl.addPause(label);
  };

  JDMBanner.prototype.addListeners = function(){
     JDMBanner.scope.containerJDMBanner.addEventListener('click', JDMBanner.scope.goClickTag);
  };

  JDMBanner.prototype.goClickTag = function(){
    // CLICKTAG
  };

  return JDMBanner;
})();





