import simpleAlert from '../utility/alert-boxes';

export default function AllowIfOnline(isOffLine, callBack) {
  if (isOffLine)
    simpleAlert({
      title: 'Offline! No Internet!',
      content: `Please make sure you are connected to internet.`,
      okText: 'Ok',
    });
  else callBack();
}
