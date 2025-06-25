import '../../util/admin-context-guard';
import ImageData from "../image-data";
import { mapI18nValues } from '../../service/admin-language-service';
import { type IImageData } from '@nandos-types/model/image';
import { type I18NString } from '@nandos-types/model/language';
import { type IStoreFacility } from '@nandos-types/model/authoring/store-facility';

export default class StoreFacility implements IStoreFacility {
    
    public title: I18NString;
    public type: string;
    public icon: Record<string, IImageData>;

    constructor(data: IStoreFacility = {
        title: {},
        type: '',
        icon: {}
    }) {
        this.title = mapI18nValues(data.title);
        this.type = data.type;
        this.icon = mapI18nValues(data.icon, (icon: IImageData) => new ImageData(icon));
    }
}