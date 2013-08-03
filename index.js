/*

  PageHammer
  
*/

var Emitter = require('emitter');
var $ = require('jquery');

module.exports = PageFader;

var options_defaults = {
  masksize:1,
  animtime:2000,
  perspective:800
}

function PageFader(options){
  options = this.options = options || {};

  for(var prop in options_defaults){
    if(options[prop]===null || options[prop]===undefined){
      options[prop] = options_defaults[prop];
    }
  }

  if (!(this instanceof PageFader)) return new PageFader(options);

  var self = this;

  Emitter.call(this);

  this.options = options;

  this.page_html = [];
  this.currentpage = 0;

  this.book = $(this.options.bookselector);

  if(this.book.length<=0){
    throw new Error('pageturner cannot find the element for the book');
  }
}

/**
 * Inherit from `Emitter.prototype`.
 */

PageFader.prototype = new Emitter;

PageFader.prototype.render = function(){
  var self = this;
  this.pages = this.book.find(this.options.pageselector);

  if(this.pages.length<=0){
    throw new Error('pageturner cannot find any pages for the book');
  }

  var html = [];
  this.pages.each(function(){
    html.push('<div class="pagewrapper"><div class="bookpage">' + $(this).html() + '</div></div>');
  })

  var allhtml = '<div id="allwrapper">' + html.join('') + '</div>';

  this.book.html(allhtml);

  this.allwrapper = this.book.find('#allwrapper');
  this.allwrapper.css({
    position:'absolute',
    overflow:'hidden'
  })
  this.pages = this.book.find('.pagewrapper');
  this.book.css({
    overflow:'hidden'
  })
  this.pages.css({
    position:'absolute'    
  })

  this.pages.css({
    display:'none'
  })
  this.pages.eq(0).css({
    display:'block'
  })

  setAnimationTime(this.pages, 1200);

  this.currentpage = 0;
  this.resize();

  this.emit('loaded', this.currentpage);


  var resizingID = null;

  $(window).resize(function(){
    if(resizingID){
      clearTimeout(resizingID);
    }
    resizingID = setTimeout(function(){
      self.resize();
    }, 100)
    
  })
}

PageFader.prototype.resize = function(){
  var self = this;
  this.size = {
    width:this.book.width(),
    height:this.book.height()
  }

  this.book.width(this.size.width).height(this.size.height);
  this.pages.width(this.size.width).height(this.size.height);
  this.pages.each(function(index){
    $(this).css({
      left:((index) * self.size.width) + 'px'
    })
  })
  this.emit('resize', this.size);
}

PageFader.prototype.animate_direction = function(dir){
  var nextpage = this.currentpage + dir;
  if(nextpage<0 || nextpage>=this.pages.length){
    return;
  }

  var currentelem = this.pages.eq(this.currentpage);
  var nextelem = this.pages.eq(nextpage);
  
  var offset = (-nextpage * (this.size.width));

  currentelem.css({
    left:-(this.size.width) + 'px'
  })

  setTimeout(function(){
    currentelem.css({
      display:'none'
    })
  }, this.options.animtime)

/*
  var currentelem = this.pages.eq(this.currentpage);
  var nextelem = this.pages.eq(nextpage);

  nextelem.insertAfter(currentelem);

  nextelem.show();

  setTimeout(function(){
    currentelem.hide();
  }, 100)

  */
  this.currentpage = nextpage;
  this.emit('loaded', this.currentpage);

}

function setAnimationTime(elem, ms){
  ['', '-webkit-', '-moz-', '-ms-', '-o-'].forEach(function(prefix){
    elem.css(prefix + 'transition', 'all ' + ms + 'ms');
  })
}