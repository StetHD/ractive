import AliasWrapper from './AliasWrapper';
import Fragment from 'virtualdom/Fragment';
import runloop from 'global/runloop';
import { unbind } from 'shared/methodCallers';

class EachBlock {
	constructor ( section, type, fragmentOptions, aliases ) {
		this.type = type;
		this.section = section;
		this.fragmentOptions = fragmentOptions;
		this.aliases = aliases;
		this.members = null;
	}

	setMembers ( members ) {
		var section = this.section,
			currentLength = section.length,
			newLength = members.length;

		this.members = members;

		// same? nothing to do
		if ( newLength === currentLength ) {
			return;
		}

		// shorter? remove items
		if ( newLength < currentLength ) {
			let len = currentLength - newLength, i, unrender;

			unrender = section.fragmentsToUnrender = section.fragments.splice( newLength, len );

			for ( i = 0; i < len; i++ ) {
				unrender[i].unbind();
			}
		}

		// longer? add new ones
		else {
			let i, toSplice, fragments = section.fragments;

			// fragments.length = newLength

			if ( section.rendered ) {
				toSplice = new Array(newLength - currentLength + 2)
				toSplice[0] = currentLength;
				toSplice[1] = 0;
			}

			for ( i = currentLength; i < newLength; i += 1 ) {
				fragments[i] = this.createFragment( i );
				if ( toSplice ) {
					toSplice[ i - currentLength + 2 ] = fragments[i];
				}
			}

			if ( toSplice ) {
				section.fragmentsToSplice = toSplice;
			}
		}

		section.length = newLength;

		// TODO: see how this shakes out,
		// probably a method on section.
		// or maybe something else
		section.bubble();

		if ( section.rendered ) {
			runloop.addView( section );
		}
	}

	updateMembers ( splice ) {
		const section = this.section;

		// if array was previously empty, we might not have members
		if ( !this.members ) {
			this.setMembers( section.context.members );
			return;
		}

		const fragments = section.fragments,
			  args = new Array( 2 + splice.insert );

		var removed, len;

		args[0] = splice.start;
		args[1] = splice.remove;

		if ( splice.insert ) {
			let arg = 2,
				i = splice.start,
				end = splice.start + splice.insert;

			while ( i < end ) {
				args[ arg ] = this.createFragment( i );
				i++;
				arg++;
			}

			section.fragmentsToSplice = args;
		}

		removed = section.fragmentsToUnrender = fragments.splice.apply( fragments, args );

		if ( len = removed.length ) {
			for( let i = 0; i < len; i++ ) {
				removed[i].unbind();
			}
		}

		if ( splice.insert !== splice.remove ) {
			section.length = fragments.length;
		}

		// TODO: see how this shakes out,
		// probably a method on section.
		// or maybe something else
		section.bubble();

		if ( section.rendered ) {
			runloop.addView( section );
		}
	}

	createFragment ( index ) {
		var context = this.members[ index ],
			fragmentOptions = this.fragmentOptions;

		if ( this.aliases ) {
			context = new AliasWrapper( context, this.aliases );
		}

		// append list item to context stack
		fragmentOptions.context = context;
		// TODO: I don't think this will be needed
		// and can be deleted
		fragmentOptions.index = index;

		return new Fragment( fragmentOptions );

	}

	unrender () {
		this.setMembers( [] );
	}
}



export default EachBlock;