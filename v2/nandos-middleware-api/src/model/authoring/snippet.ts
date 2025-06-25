import '../../util/admin-context-guard'
import { mapI18nValues } from '../../service/admin-language-service'
import { type  I18NString } from '@nandos-types/model/language';
import { type ISnippet } from '@nandos-types/model/authoring';

export default class Snippet implements ISnippet {

  public id: string;
  public snippet: I18NString;
  
  constructor(data: ISnippet = {
    id: '',
    snippet: {}
  }) {
    this.id = data.id
    this.snippet = mapI18nValues(data.snippet)
  }
}