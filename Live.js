import React, { Component } from 'react';
import { ActivityIndicator, Alert, AsyncStorage, Button, StyleSheet, Text, ScrollView, View,ImageBackground,TouchableOpacity } from 'react-native';
import { ListItem, SearchBar } from 'react-native-elements';
import {Icon} from 'native-base'
import Toast, { DURATION } from 'react-native-easy-toast';

import getCategories from './api/getCategories';
import getChannels from './api/getChannels';

import getLocalizedString from './utils/getLocalizedString';

import SegmentedButton from './utils/segmentedButton';
import { totalSize,width,height } from 'react-native-dimension';

let categoriesAndChannels = [];

let categoriesLeft = 0;
let channelsFetched = 0;

let loadingChannelsFromCategories = true;

let menuItems = [];
let listItems = [];
let filteredList = [];
let weAreSearching = false;

let activityIndicator = <ActivityIndicator animating hidesWhenStopped size='large' />;
let activityIndicatorText = <Text>{getLocalizedString('live.activityIndicatorText', null, [categoriesLeft, channelsFetched])}</Text>;

const colors = {
	black: '#fff',
	gray: '#d3d3d3',
};

const styles = StyleSheet.create({
	activityContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	listContainer: {
		flex: 1,
	},
	sectionHeader: {
		paddingTop: 2,
		paddingLeft: 10,
		paddingRight: 10,
		paddingBottom: 2,
		fontSize: 26,
		fontWeight: 'bold',
		backgroundColor: colors.black,
	},
	listItem: {
		padding: 10,
		color : 'black',
		fontSize: 20,
		height: 44,
	},
});

function isLetterOrNumber(c) {
	if (/^\d/.test(c)) {
		return true;
	}

	return c.toLowerCase() !== c.toUpperCase();
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

class LiveScreen extends Component {
	async componentWillMount() {
		this.clearOnEmpty();

		const liveArray = await AsyncStorage.getItem('@IPTVPlayer:LiveArray');
		if (liveArray && liveArray.length > 0) {
			categoriesAndChannels = JSON.parse(liveArray);

			categoriesAndChannels.forEach((c) => {
				menuItems.push({ text: c.category_name, data: [] });

				c.channels.forEach((ch) => {
					menuItems[menuItems.length - 1].data.push(ch);
				});
			});

			menuItems.sort(function(a, b) { return a.text > b.text; });

			if (menuItems.length) {
				this.onCategoryButton(null, 0);
			}

			loadingChannelsFromCategories = false;

			this.forceUpdate();

			return;
		}

		const {
			url, username, password, buttonIndex,
		} = this.props.navigation.state.params;

		await getCategories(url, username, password, buttonIndex)
			.then((r) => {
				categoriesAndChannels.push(...r);

				/* eslint-disable no-return-assign */
				categoriesAndChannels.forEach((o, i, a) => a[i].channels = []);
				/* eslint-enable no-return-assign */
			});

		categoriesLeft = categoriesAndChannels.length;

		/* eslint-disable no-restricted-syntax, guard-for-in, no-await-in-loop */
		for (const category in categoriesAndChannels) {
			await sleep(1500);
			categoriesAndChannels[category].channels = await getChannels(url, username, password, categoriesAndChannels[category].category_id);

			categoriesLeft--;

			channelsFetched += categoriesAndChannels[category].channels.length;

			activityIndicatorText = <Text>{getLocalizedString('live.activityIndicatorText', null, [categoriesLeft, channelsFetched])}</Text>;

			this.forceUpdate();
		}

		for (const category in categoriesAndChannels) {
			if (!categoriesAndChannels[category].channels.length) {
				categoriesAndChannels[category] = null;
			}
		}
		/* eslint-disable no-restricted-syntax, guard-for-in, no-await-in-loop */

		categoriesAndChannels = categoriesAndChannels.filter(x => x);

		try {
			await AsyncStorage.setItem('@IPTVPlayer:LiveArray', JSON.stringify(categoriesAndChannels));
		} catch (error) {
			throw new Error(error);
		}

		categoriesAndChannels.forEach((c) => {
			menuItems.push({ text: c.category_name, data: [] });

			c.channels.forEach((ch) => {
				menuItems[menuItems.length - 1].data.push(ch);
			});
		});

		menuItems.sort(function(a, b) { return a.text > b.text; });

		if (menuItems.length) {
			this.onCategoryButton(null, 0);
		}

		loadingChannelsFromCategories = false;

		activityIndicator = null;
		activityIndicatorText = null;

		this.forceUpdate();
	}

	render() {
		if (loadingChannelsFromCategories) {
			return (
				<ScrollView contentContainerStyle={styles.activityContainer}>
					{activityIndicator}
					{activityIndicatorText}
				</ScrollView>
			);
		}

		if (!categoriesAndChannels.length) {
			Alert.alert(
				getLocalizedString('live.noCategoriesError'),
				getLocalizedString('live.noCategoriesErrorDesc'),
				[
					{ text: 'OK', onPress: () => this.props.navigation.navigate('Account', this.props.navigation.state.params) },
				],
				{ cancelable: false }
			);
		}

		return (
			<ImageBackground
			source={require('./assets/background.jpg')}
			style={{ flex: 1, height: undefined, width: undefined }}>

			{/* HEADER STYLE  */}
			<View style={{flexDirection : 'row'}}>
				<TouchableOpacity>
					<Icon name="ios-arrow-back" style={{color : 'white',marginLeft : totalSize(1)}}></Icon>
				</TouchableOpacity>
				<Text style={{color : 'white',marginLeft : totalSize(31),textAlign : 'center',fontSize : totalSize(4)}}>Live TV</Text>
			</View>
			{/* HEADER STYLE  */}

			<ScrollView contentContainerStyle={styles.listContainer}>
				<SegmentedButton
					items={menuItems}
					onSegmentBtnPress={(btn, index) => this.onCategoryButton(btn, index)} />
				{/* <View>
					<SearchBar
						ref={(search) => { this.search = search; }}
						onChangeText={text => this.searchForChannels(text)}
						placeholder={getLocalizedString('live.searchPlaceholder')}
						round />
				</View> */}
				<View style={{flexDirection : 'row'}}>
				<ScrollView style={{width : width(60)}}>
					{weAreSearching ? filteredList : listItems}
				</ScrollView>
				<View style={{width : width(30), marginLeft: totalSize(3),marginTop : totalSize(5),marginRight: totalSize(3),height:height(50),backgroundColor : 'black'}}>

				</View>
				</View>
				<Toast ref={(c) => { this.toast = c; }} />
			</ScrollView>
			</ImageBackground>
		);
	}

	onCategoryButton(btn, index) {
		const { url, username, password } = this.props.navigation.state.params;

		weAreSearching = false;
		filteredList = [];
		if (this.search) {
			this.search.clearText();
		}

		listItems = [];

		menuItems[index].data.forEach((ch) => {
			let chItem = null;

			if (!ch.name.length) {
				return;
			}

			if (ch.name.charAt(0) !== '(' && !isLetterOrNumber(ch.name.charAt(0))) {
				chItem = <Button key={ch.stream_id} disabled onPress={() => {}} style={styles.listItem} title={ch.name} />;

				listItems.push(chItem);

				return;
			}

			chItem = ch.stream_icon.startsWith('http') || ch.stream_icon.startsWith('https') ? (
				<ListItem
					key={ch.stream_id}
					avatar={{ uri: ch.stream_icon }}
					containerStyle={{ borderBottomWidth: 1, borderBottomColor : 'black' }}
					onPress={() => this.props.navigation.navigate('LiveChannel', {
						url, username, password, ch,
					})}
					titleStyle={{color : 'black'}}
					roundAvatar
					rightIcon={{color : 'black'}}
					title={ch.name.toUpperCase()} />
			) : (
				<ListItem
					key={ch.stream_id}
					containerStyle={{ borderBottomWidth: 1,  borderBottomColor : 'black' }}
					onPress={() => this.props.navigation.navigate('LiveChannel', {
						url, username, password, ch,
					})}
					titleStyle={{color : 'black'}}
					rightIcon={{color : 'black'}}
					roundAvatar
					title={ch.name.toUpperCase()} />
			);

			listItems.push(chItem);
		});

		this.forceUpdate();
	}

	clearOnEmpty() {
		categoriesAndChannels = [];

		categoriesLeft = 0;
		channelsFetched = 0;

		loadingChannelsFromCategories = true;

		menuItems = [];
		listItems = [];
		filteredList = [];
		weAreSearching = false;

		activityIndicator = <ActivityIndicator animating hidesWhenStopped size='large' />;
		activityIndicatorText = <Text>{getLocalizedString('live.activityIndicatorText', null, [categoriesLeft, channelsFetched])}</Text>;

		return this;
	}

	searchForChannels(getText) {
		filteredList = [];

		const text = getText.toLowerCase();

		if (!text || text === '') {
			weAreSearching = false;

			this.forceUpdate();

			return;
		}

		filteredList = listItems.filter((item) => {
			return item.props.title.toLowerCase().match(text);
		});

		if (!filteredList.length) {
			weAreSearching = false;

			this.toast.show(getLocalizedString('live.filterChannelsNotFound'), DURATION.LENGTH_LONG);

			this.forceUpdate();

			return;
		}

		weAreSearching = true;

		filteredList.sort(function(a, b) { return a.title > b.title; });

		this.forceUpdate();
	}
}

export default LiveScreen;
