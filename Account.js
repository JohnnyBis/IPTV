import React, { Component } from 'react';
import { Alert, AsyncStorage, StyleSheet, ScrollView, ImageBackground, View, TouchableOpacity, Image } from 'react-native';
// import { Button, ButtonGroup, Card, Icon } from 'react-native-elements';
import { Container, Button, Text, Row } from 'native-base'
import timeConverter from './utils/timeConverter';
import getLocalizedString from './utils/getLocalizedString';
import { totalSize, width } from 'react-native-dimension';

const color = {
	black: '#000',
	lightBlue: '#68a0cf',
	transparent: 'transparent',
};

const styles = StyleSheet.create({
	accountInfo: {
		fontSize: 16,
		marginBottom: 10,
	},
	menuHorizontal: {
		alignSelf: 'flex-end',
		// justifyContent : 'center',
		marginLeft: totalSize(4)
	},
	menuLink: {
		color: 'black',
		fontSize: totalSize(2.5),
		textDecorationLine: 'underline',
		fontWeight: 'bold'

	},
	menuLink1: {
		color: 'black',
		fontSize: totalSize(6),
		textDecorationLine: 'underline',
		fontWeight: 'bold'
	}
});

class Account extends Component {
	/* eslint-disable react/sort-comp */
	static navigationOptions = ({ navigation }) => {
		const { state } = navigation;
		const { signOutButton } = 'params' in state && state.params;

		return {
			headerRight: signOutButton && signOutButton(),
		};
	}
	/* eslint-enable react/sort-comp */

	componentWillMount() {
		const signOutButton = (
			<Button
				onPress={() => this.cleanAndExit()}
				title={getLocalizedString('account.signOutButton')} />
		);

		this.props.navigation.setParams({ signOutButton: () => signOutButton });
	}

	cleanAndExit = async () => {
		await AsyncStorage.removeItem('@IPTVPlayer:LiveArray');
		await AsyncStorage.removeItem('@IPTVPlayer:VODArray');
		this.props.navigation.navigate('Login');
	}

	buttonPressed(buttonIndex) {
		const {
			url, username, password, user_info,
		} = this.props.navigation.state.params;

		if (user_info.status === 'Expired') {
			Alert.alert(
				getLocalizedString('account.expiredError'),
				getLocalizedString('account.expiredErrorDesc'),
				[
					{ text: 'OK' },
				],
				{ cancelable: false }
			);

			return;
		}

		if (parseInt(user_info.active_cons) >= parseInt(user_info.max_connections)) {
			Alert.alert(
				getLocalizedString('account.activeConsError'),
				getLocalizedString('account.activeConsErrorDesc'),
				[
					{ text: 'OK' },
				],
				{ cancelable: false }
			);

			return;
		}

		if (buttonIndex === 0) {
			this.props.navigation.navigate('Live',
				{
					url, username, password, buttonIndex, user_info,
				});
		} else if (buttonIndex === 1) {
			this.props.navigation.navigate('VODs',
				{
					url, username, password, buttonIndex, user_info,
				});
		} else if (buttonIndex === 2) {
			this.props.navigation.navigate('Series',
				{
					url, username, password, buttonIndex, user_info,
				});
		}
	}


onClick(itemIndex) {
	console.log("Selected: " + items[itemIndex]);
}


render() {
	const items = ['Menu Item 1', 'Menu Item 2', 'Menu Item 3', 'Menu Item 4', 'Menu Item 5'];


	const { user_info } = this.props.navigation.state.params;

	const checkForMessage = user_info.message ? <Text selectable={false} style={styles.accountInfo}> {getLocalizedString('account.message')} {user_info.message} </Text> : null;

	const liveButton = () => <Icon name='television' type='font-awesome' />;
	const vodButton = () => <Icon name='video-camera' type='font-awesome' />;
	const seriesButton = () => <Icon name='film' type='font-awesome' />;
	const buttons = [{ element: liveButton }, { element: vodButton }, { element: seriesButton }];

	return (
		<Container>
			<ImageBackground
				source={require('./assets/background.jpg')}
				style={{ flex: 1, height: undefined, width: undefined }}>
				{/* HEADER BUTTON */}
				<View>
					{/* CUSTOMER SUPPORT  */}
					<TouchableOpacity style={{ position: 'absolute', top: totalSize(2), left: totalSize(2) }}>
						<Image style={{ height: totalSize(5), width: totalSize(5) }} source={require('./assets/support.png')} />
					</TouchableOpacity>
					{/* CUSTOMER SUPPORT  */}
					{/* BUY  */}
					<TouchableOpacity style={{ position: 'absolute', top: totalSize(2), right: totalSize(2) }}>
						<Image style={{ height: totalSize(5), width: totalSize(5) }} source={require('./assets/shopping-cart.png')} />
					</TouchableOpacity>
					{/* BUY  */}
				</View>
				{/* HEADER BUTTON */}


				{/* CONTENT HERE  */}
				<View style={{ marginTop: totalSize(10), alignItems: 'center' }}>
					<Image style={{ width: totalSize(20), height: totalSize(20) }} source={require('./assets/apple.png')} />
				</View>
				{/* CONTENT HERE  */}


				{/* HORIZONTAL MENU  */}
				<View style={{ position: 'absolute', bottom: totalSize(2) }}>
					<ScrollView horizontal={true} contentContainerStyle={{}}>
						<View style={styles.menuHorizontal}><TouchableOpacity onPress={() => this.buttonPressed(2)}><Text style={styles.menuLink}>RATE EPG</Text></TouchableOpacity></View>
						<View style={styles.menuHorizontal}><TouchableOpacity onPress={() => this.buttonPressed(1)}><Text style={styles.menuLink}>VIDEO CAM</Text></TouchableOpacity></View>
						<View style={styles.menuHorizontal}><TouchableOpacity onPress={() => this.buttonPressed(0)}><Text style={styles.menuLink1}>LIVE TV</Text></TouchableOpacity></View>
						<View style={styles.menuHorizontal}><TouchableOpacity onPress={() => this.buttonPressed(2)}><Text style={styles.menuLink}>FILM</Text></TouchableOpacity></View>
						<View style={styles.menuHorizontal}><TouchableOpacity onPress={() => this.buttonPressed(0)}><Text style={styles.menuLink}>SETTING</Text></TouchableOpacity></View>
					</ScrollView>
				</View>
				{/* HORIZONTAL MENU */}


			</ImageBackground>
		</Container>
		// <ScrollView>
		// 	<ButtonGroup
		// 		buttons={buttons}
		// 		containerStyle={{ backgroundColor: color.transparent, borderColor: color.black }}
		// 		innerBorderStyle={{ color: color.black }}
		// 		onPress={buttonIndex => this.buttonPressed(buttonIndex)} />

		// 	<Card title={getLocalizedString('account.mainAccountInfo')}>
		// 		<Text selectable={false} style={styles.accountInfo} >{getLocalizedString('account.mainAccountInfoUsername')}  {user_info.username}</Text>
		// 		<Text selectable={false} style={styles.accountInfo} >{getLocalizedString('account.mainAccountInfoExpires')}  {timeConverter(user_info.exp_date)}</Text>
		// 		<Text selectable={false} style={styles.accountInfo} >{getLocalizedString('account.mainAccountInfoStatus')}  {user_info.status}</Text>
		// 		{checkForMessage}
		// 	</Card>
		// 	<Card title={getLocalizedString('account.miscAccountInfo')}>
		// 		<Text selectable={false} style={styles.accountInfo} >{getLocalizedString('account.miscAccountInfoCreated')}  {timeConverter(user_info.created_at)}</Text>
		// 		<Text selectable={false} style={styles.accountInfo} >{getLocalizedString('account.miscAccountInfoTrial')}  {user_info.is_trial === '0' ? 'No' : 'Yes'}</Text>
		// 		<Text selectable={false} style={styles.accountInfo} >{getLocalizedString('account.miscAccountInfoActiveConns')}  {user_info.active_cons}</Text>
		// 		<Text selectable={false} style={styles.accountInfo} >{getLocalizedString('account.miscAccountInfoMaxConns')}  {user_info.max_connections}</Text>
		// 	</Card>
		// </ScrollView>
	);
}
}

export default Account;
