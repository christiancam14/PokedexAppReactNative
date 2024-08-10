import {FlatList, View} from 'react-native';
import {globalTheme} from '../../../config/theme/theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ActivityIndicator, Text, TextInput} from 'react-native-paper';
import {Pokemon} from '../../../domain/entities/pokemon';
import {PokemonCard} from '../../components/pokemons/PokemonCard';
import {useQuery} from '@tanstack/react-query';
import {
  getPokemonNamesWithId,
  getPokemonsByIds,
} from '../../../actions/pokemons';
import {useMemo, useState} from 'react';
import {FullScreenLoader} from '../../components/ui/FullScreenLoader';
import {useDebouncedValue} from '../../hooks/useDebouncedValue';

export const SearchScreen = () => {
  const {top} = useSafeAreaInsets();
  const [term, setTerm] = useState('');

  const debouncedValue = useDebouncedValue(term);

  const {isLoading, data: pokemonNameList = []} = useQuery({
    queryKey: ['pokemons', 'all'],
    queryFn: async () => getPokemonNamesWithId(),
  });

  // TODO: Aplicar debounce
  const pokemonNameIdList = useMemo(() => {
    // Es un  número
    if (!isNaN(Number(debouncedValue))) {
      const pokemon = pokemonNameList.find(
        pokemon => pokemon.id === Number(debouncedValue),
      );
      return pokemon ? [pokemon] : [];
    }

    if (debouncedValue.length === 0) return [];
    if (debouncedValue.length < 3) return [];

    return pokemonNameList.filter(pokemon =>
      pokemon.name.includes(debouncedValue.toLocaleLowerCase()),
    );
  }, [debouncedValue]);

  const {isLoading: isLoadingPokemons, data: pokemons = []} = useQuery({
    queryKey: ['pokemons', 'by', pokemonNameIdList],
    queryFn: async () =>
      getPokemonsByIds(pokemonNameIdList.map(pokemon => pokemon.id)),
  });

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <View style={[globalTheme.globalMargin, {paddingTop: top + 10}]}>
      <TextInput
        placeholder="Buscar Pokémon"
        mode="flat"
        autoFocus
        autoCorrect={false}
        onChangeText={value => setTerm(value)}
        value={term}
      />

      {isLoadingPokemons && <ActivityIndicator style={{paddingTop: 20}} />}

      <FlatList
        data={pokemons}
        keyExtractor={(pokemon: Pokemon, index) => `${pokemon.id}-${index}`}
        numColumns={2}
        style={{paddingTop: top + 20}}
        renderItem={({item: pokemon}) => <PokemonCard pokemon={pokemon} />}
        showsHorizontalScrollIndicator={false}
        ListFooterComponent={<View style={{height: 120}} />}
      />
    </View>
  );
};
