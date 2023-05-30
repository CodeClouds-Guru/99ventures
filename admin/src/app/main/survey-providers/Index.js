import List from '../crud/list/List';

const Index = () => {
    return (
        <List
            module={'survey-providers'}
            addable={false}
            deletable={false}
        />
    )
}

export default Index;