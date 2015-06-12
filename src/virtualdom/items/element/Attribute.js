import Fragment from '../../Fragment';
import Item from '../shared/Item';
import getUpdateDelegate from './attribute/getUpdateDelegate';
import { isArray } from 'utils/is';
import { safeToStringValue } from 'utils/dom';

export default class Attribute extends Item {
	constructor ( options ) {
		super( options );

		this.name = options.name;
		this.element = options.element;
		this.parentFragment = options.element.parentFragment; // shared
		this.ractive = this.parentFragment.ractive;

		this.updateDelegate = getUpdateDelegate( options );
		this.fragment = null;
		this.value = null;

		if ( !isArray( options.template ) ) {
			this.value = options.template;
		} else {
			this.fragment = new Fragment({
				owner: this,
				template: options.template
			});
		}
	}

	bind () {
		if ( this.fragment ) {
			this.fragment.bind();
			this.value = this.fragment.valueOf();
		}
	}

	render () {
		this.node = this.element.node;
		this.updateDelegate();
	}

	toString () {
		const value = safeToStringValue( this.value );

		return value ?
			`${this.name}="${value}"` :
			this.name;
	}

	update () {
		if ( this.dirty ) {
			this.updateDelegate();
			this.dirty = false;
		}
	}
}
