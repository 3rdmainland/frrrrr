import '../../../util/admin-context-guard'
import { BaseEntity } from './internal'
import { mapI18nValues } from '../../../service/admin-language-service'

export const CATEGORY_DISPLAY_TYPES = {
	DEFAULT: 'DEFAULT',
	MOST_POPULAR: 'MOST_POPULAR',
	CAROUSEL: 'CAROUSEL',
	MUTED_CHILDREN: 'MUTED_CHILDREN',
}

export default class Category extends BaseEntity {
	constructor(data) {
		super(data)
		this.name = mapI18nValues(data.name)
		this.description = mapI18nValues(data.description)
		this.displayType = CATEGORY_DISPLAY_TYPES[data.displayType]
		this.featured = !!data.featured
		this.accentColor = data.accentColor
		this.suppressChildAccentColors = !!data.suppressChildAccentColors
	}
}