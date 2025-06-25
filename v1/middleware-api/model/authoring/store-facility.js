import '../../util/admin-context-guard'
import {mapI18nValues} from '../../service/admin-language-service'
import ImageData from "../image-data"

export default class StoreFacility {

    constructor(data = {}) {
        this.title = mapI18nValues(data.title)
        this.type = data.type
        this.icon = mapI18nValues(data.icon, icon => new ImageData(icon))
    }

}