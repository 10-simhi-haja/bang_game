const packetNames = {
  auth: {
    C2SRegisterRequest: 'auth.C2SRegisterRequest',
    S2CRegisterResponse: 'auth.S2CRegisterResponse',
    C2SLoginRequest: 'auth.C2SLoginRequest',
    S2CLoginResponse: 'auth.S2CLoginResponse',
  },
  cardData: {
    CardData: 'cardData.CardData',
  },
  characterData: {
    CharacterData: 'characterData.CharacterData',
    CharacterStateInfoData: 'characterData.CharacterStateInfoData',
    CharacterPositionData: 'characterData.CharacterPositionData',
  },
  gameData: {
    UserData: 'gameData.UserData',
    GameStateData: 'gameData.GameStateData',
    RoomData: 'gameData.RoomData',
  },
  game: {
    C2SPositionUpdateRequest: 'game.C2SPositionUpdateRequest',
    S2CPositionUpdateResponse: 'game.S2CPositionUpdateResponse',
    S2CPositionUpdateNotification: 'game.S2CPositionUpdateNotification',

    C2SUseCardRequest: 'game.C2SUseCardRequest',
    S2CUseCardResponse: 'game.S2CUseCardResponse',

    S2CUseCardNotification: 'game.S2CUseCardNotification',
    S2CEquipCardNotification: 'game.S2CEquipCardNotification',
    S2CCardEffectNotification: 'game.S2CCardEffectNotification',

    S2CFleaMarketNotification: 'game.S2CFleaMarketNotification',
    C2SFleaMarketPickRequest: 'game.C2SFleaMarketPickRequest',
    S2CFleaMarketPickResponse: 'game.S2CFleaMarketPickResponse',

    S2CUserUpdateNotification: 'game.S2CUserUpdateNotification',

    S2CPhaseUpdateNotification: 'game.S2CPhaseUpdateNotification',

    C2SReactionRequest: 'game.C2SReactionRequest',
    S2CReactionResponse: 'game.S2CReactionResponse',

    C2SDestroyCardRequest: 'game.C2SDestroyCardRequest',
    S2CDestroyCardResponse: 'game.S2CDestroyCardResponse',

    S2CGameEndNotification: 'game.S2CGameEndNotification',

    C2SCardSelectRequest: 'game.C2SCardSelectRequest',
    S2CCardSelectResponse: 'game.S2CCardSelectResponse',

    C2SPassDebuffRequest: 'game.C2SPassDebuffRequest',
    S2CPassDebuffResponse: 'game.S2CPassDebuffResponse',
    S2CWarningNotification: 'game.S2CWarningNotification',

    S2CAnimationNotification: 'game.S2CAnimationNotification',
  },
  gameState: {
    C2SGamePrepareRequest: 'gameState.C2SGamePrepareRequest',
    S2CGamePrepareResponse: 'gameState.S2CGamePrepareResponse',
    S2CGamePrepareNotification: 'gameState.S2CGamePrepareNotification',
    C2SGameStartRequest: 'gameState.C2SGameStartRequest',
    S2CGameStartResponse: 'gameState.S2CGameStartResponse',
    S2CGameStartNotification: 'gameState.S2CGameStartNotification',
  },
  room: {
    C2SCreateRoomRequest: 'room.C2SCreateRoomRequest',
    S2CCreateRoomResponse: 'room.S2CCreateRoomResponse',
    C2SGetRoomListRequest: 'room.C2SGetRoomListRequest',
    S2CGetRoomListResponse: 'room.S2CGetRoomListResponse',
    C2SJoinRoomRequest: 'room.C2SJoinRoomRequest',
    S2CJoinRoomResponse: 'room.S2CJoinRoomResponse',
    C2SJoinRandomRoomRequest: 'room.C2SJoinRandomRoomRequest',
    S2CJoinRandomRoomResponse: 'room.S2CJoinRandomRoomResponse',
    S2CJoinRoomNotification: 'room.S2CJoinRoomNotification',
    C2SLeaveRoomRequest: 'room.C2SLeaveRoomRequest',
    S2CLeaveRoomResponse: 'room.S2CLeaveRoomResponse',
    S2CLeaveRoomNotification: 'room.S2CLeaveRoomNotification',
  },
  packet: {
    CommonPacket: 'packet.CommonPacket',
    GamePacket: 'packet.GamePacket',
  },
};

export default packetNames;
