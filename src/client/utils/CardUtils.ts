import {CardModel} from '@/common/models/CardModel';
import {CardType} from '@/common/cards/CardType';
import {PublicPlayerModel} from '@/common/models/PlayerModel';
import {getClientCard} from '@/client/cards/CustomCardAdapter';

export function getCardsByType(inCards: ReadonlyArray<CardModel>, cardTypes: ReadonlyArray<CardType>): ReadonlyArray<CardModel> {
  const outCards = inCards.filter((inCard) => {
    const outCard = getClientCard(inCard);
    if (outCard === undefined) {
      return false;
    }
    return cardTypes.includes(outCard.type);
  });
  return outCards.reverse();
}

export function isCardActivated(card: CardModel, player: PublicPlayerModel): boolean {
  return player.actionsThisGeneration.includes(card.name) || (card.isDisabled === true);
}
