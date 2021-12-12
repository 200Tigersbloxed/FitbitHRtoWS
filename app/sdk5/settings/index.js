function MainSettings(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">WebSocket Settings</Text>}>
        <TextInput
          settingsKey="wsUriSettings"
          label="WS Uri"
        />
        <TextInput
          settingsKey="serverPassSettings"
          label="Server Password"
        >CHANGEME</TextInput>
        <Toggle
          settingsKey="PublicServer"
          label="Public Server"
        ></Toggle>
        <TextInput
          settingsKey="PublicServerCode"
          label="Public Server Code (Letters only!)"
        >CHANGEME</TextInput>
      </Section>
    </Page>
  );
}

registerSettingsPage(MainSettings);