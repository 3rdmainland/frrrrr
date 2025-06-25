import ImageCollection from './image-collection'
import {
  PROMOTION_TYPE, 
  type TPromotionType, 
  type IPromotion 
} from '@nandos-types/model/promotion';

export default class Promotion {

  public id: string;
  public name: string;
  public link: string;
  public displayOrder: number;
  public type: TPromotionType;
  public linkText: string;
  public youtubeId: string;
  public index: number;
  public description: string;
  public dateStart: Date;
  public dateEnd: Date;
  public imageCollection: ImageCollection;
  public accentColor: string;
  
  constructor(data: IPromotion = {
    id: '',
    name: '',
    link: '',
    linkText: '',
    youtubeId: '',
    index: 0,
    description: '',
    dateStart: 0,
    dateEnd: 0,
    images: [],
    accentColor: '',
    type: 'DEFAULT',
    displayOrder: 0
  }) {
    this.id = data.id;
    this.name = data.name;
    this.link = data.link;
    this.type = data.type;
    this.displayOrder = data.displayOrder;
    this.linkText = data.linkText;
    this.youtubeId = data.youtubeId;
    this.index = data.index;
    this.description = data.description;
    this.dateStart = new Date(data.dateStart || 0);
    this.dateEnd = new Date(data.dateEnd || 0);
    this.imageCollection = new ImageCollection(data.images);
    this.accentColor = data.accentColor;
  }
  
  get appSplashScreen() {
    return this.type === PROMOTION_TYPE.APP_SPLASH_SCREEN;
  }

  get linkIsExternal() {
    return this.link != null && this.link.includes('http');
  }

  get internalPath() {
    return this.link != null && 
      process.env.VUE_APP_ROUTER_BASE_PATH && 
      this.link.replace(process.env.VUE_APP_ROUTER_BASE_PATH, '');
  }
}