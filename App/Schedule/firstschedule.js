import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import MyStatusBar from '../Utilities/statusbar';
import Commonheader from '../Components/Commonheader';
import { RFValue } from 'react-native-responsive-fontsize';
import { devicewidth } from '../Utilities/Dimensions';
import { Fonts } from '../Utilities/fonts';
import Custombutton from '../Components/button';
import { GetFirstSchedule, profileSelector } from '../Slices/profile'; 

const FirstSchedule = ({ navigation }) => {
  const dispatch = useDispatch();
  const { firstSchedule, loader } = useSelector(profileSelector);
  const [dataFetched, setDataFetched] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(GetFirstSchedule());
      setDataFetched(true);
    };

    fetchData();
  }, [dispatch]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <MyStatusBar backgroundColor={"#111111"} barStyle={"light-content"} />
      <Commonheader title={"First Schedule"} home={false} onPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.container}>
        {loader && !dataFetched ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          <View style={styles.content}>
            <Text style={styles.title}>First Schedule</Text>

            <View contentContainerStyle={styles.tableContainer}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Section</Text>
                <Text style={styles.tableHeaderText}>Offence</Text>
                <Text style={styles.tableHeaderText}>Punishment</Text>
                <Text style={styles.tableHeaderText}>Cognizable/Non- cognizable</Text>
                <Text style={styles.tableHeaderText}>Bailable/Non- bailable</Text>
                <Text style={styles.tableHeaderText}>Court triable</Text>
              </View>

              {/* Table Data */}
              {firstSchedule?.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{item.Section}</Text>
                  <Text style={styles.tableCell}>{item.Offence}</Text>
                  <Text style={styles.tableCell}>{item.Punishment}</Text>
                  <Text style={styles.tableCell}>{item['Cognizable or Non-cognizable']}</Text>
                  <Text style={styles.tableCell}>{item['Bailable or Non-bailable']}</Text>
                  <Text style={styles.tableCell}>{item['By what Court triable']}</Text>
                </View>
              ))}
            </View>

            <Custombutton title="Go Back" onPress={() => navigation.goBack()} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: RFValue(16),
  },
  content: {
    width: devicewidth * 0.95,
    backgroundColor: '#f8f8f8',
    borderRadius: RFValue(10),
    padding: RFValue(16),
    alignItems: 'center',
  },
  title: {
    fontSize: RFValue(20),
    fontFamily: Fonts.Medium,
    marginBottom: RFValue(10),
    color: '#111',
  },
  tableContainer: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ddd',
    paddingVertical: RFValue(10),
    paddingHorizontal: RFValue(8),
  },
  tableHeaderText: {
    fontSize: RFValue(12),
    fontFamily: Fonts.Bold,
    color: '#111',
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allow rows to wrap
    justifyContent: 'space-between',
    paddingVertical: RFValue(10),
    paddingHorizontal: RFValue(8),
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableCell: {
    fontSize: RFValue(10),
    fontFamily: Fonts.Regular,
    color: '#333',
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: RFValue(4),
  },
});

export default FirstSchedule;
