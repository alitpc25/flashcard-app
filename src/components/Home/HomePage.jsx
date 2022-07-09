import { ReactComponent as QuizPhoto } from '../../assets/img/undraw_quiz_re_aol4.svg';
import "./HomePage.css"

function HomePage() {

    return (
        <div className='homePage container'>
            <QuizPhoto className="photo col-xs" />
            <div className='stringDiv col-xs'>
                <h1 className="strings title">Welcome to Vocabulary Builder</h1>
                <h5 className="strings">You can learn English words by practicing your own words.</h5>
            </div>
        </div>
    )
}

export default HomePage