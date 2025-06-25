import ImageData from './image-data';
import { type I18NString } from '@nandos-types/model/language';
import { type IStoreFacility } from '@nandos-types/model/store-facility';

export default class StoreFacility {

    public title: I18NString;
    public type: string;
    public icon: ImageData;

    constructor(data: IStoreFacility = {
        title: {},
        type: '',
        icon: {
            id: '',
            path: '',
            name: '',
            width: 0,
            height: 0,
            contentType: '',
            file: ''
        }
    }) {
        this.title = data.title;
        this.type = data.type;
        this.icon = data.icon && new ImageData(data.icon).resize(40, 40);
    }
}